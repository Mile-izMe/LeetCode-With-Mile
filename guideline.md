# Guideline: Migrate Melody Stream sang Spring Boot
## Kết hợp học lý thuyết + build project thực tế (Tháng 6 - 7 / 2026)

> **Nguyên tắc xuyên suốt:** Mỗi tuần học lý thuyết gì → áp dụng ngay vào Melody Stream. Không học tách rời.

---

## TỔNG QUAN KIẾN TRÚC MỤC TIÊU

```
Client (HLS Player)
    ↓
API Gateway / Spring MVC (REST)
    ↓
Spring Boot App
    ├── Spring Security (JWT + RBAC + Refresh Token)
    ├── Spring Data JPA + Hibernate (MySQL)
    ├── Redis Cache (metadata nhạc, user session)
    └── MinIO (lưu .m3u8 + .ts segments)
         ↑
    Job Queue (Spring Batch / @Async)
    (xử lý upload → FFmpeg → HLS → MinIO)
```

---

## THÁNG 6 — NỀN TẢNG DATABASE & MIGRATE CORE

---

### TUẦN 1: Setup Project + Indexing Mechanics

#### Lý thuyết cần nắm
- **B+Tree Index**: Cấu trúc cây cân bằng, MySQL InnoDB dùng B+Tree cho tất cả index. Node lá chứa data, node trong chỉ chứa key để điều hướng → phù hợp range query.
- **Clustered vs Non-Clustered Index**: Clustered = data được sắp xếp vật lý theo index đó (InnoDB dùng Primary Key làm Clustered). Non-Clustered = index riêng, trỏ về row gốc.
- **LSM-Tree**: Dùng trong NoSQL (Cassandra, RocksDB) — write nhanh vì ghi vào memory trước, flush xuống disk sau. Đọc chậm hơn B+Tree.

#### Setup Spring Boot Project (Melody Stream Java)

**1. Tạo project với Spring Initializr**
```
Dependencies cần chọn:
- Spring Web (Spring MVC)
- Spring Data JPA
- Spring Security
- MySQL Driver
- Lombok
- Validation
- Docker Compose Support
```

**2. Cấu trúc package chuẩn**
```
src/main/java/com/melodystream/
├── config/          ← SecurityConfig, RedisConfig, MinioConfig
├── controller/      ← REST endpoints
├── service/         ← Business logic
├── repository/      ← Spring Data JPA interfaces
├── entity/          ← JPA entities (map với DB table)
├── dto/             ← Request/Response objects
├── exception/       ← Custom exceptions + GlobalExceptionHandler
└── util/            ← JwtUtil, FileUtil...
```

**3. application.yml cơ bản**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/melody_stream
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect
```

**4. IoC / DI trong Spring — hiểu đúng ngay từ đầu**
```java
// ĐỪNG làm thế này (tạo object thủ công)
UserService userService = new UserService(new UserRepository());

// Spring làm thay bạn — chỉ cần khai báo
@Service
public class UserService {
    private final UserRepository userRepository; // Spring inject vào

    // Constructor injection — best practice
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```
> IoC = Spring quản lý vòng đời object (Bean). DI = Spring tự truyền dependency vào. Hai khái niệm này sẽ tự nhiên hiểu khi bạn viết code đủ nhiều.

#### Thực hành Melody Stream tuần này
Migrate entity cơ bản: `User`, `Track`, `Album`, `Playlist`

```java
@Entity
@Table(name = "tracks", indexes = {
    @Index(name = "idx_track_title", columnList = "title"),       // Non-clustered
    @Index(name = "idx_track_artist", columnList = "artist_id"),  // Non-clustered
    @Index(name = "idx_track_created", columnList = "created_at") // Non-clustered
})
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Clustered index (PK)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "artist_id")
    private Long artistId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "play_count")
    private Long playCount = 0L;

    // Getters, setters (hoặc dùng @Data của Lombok)
}
```

#### Lab: Đo tốc độ query có/không có Index
```sql
-- Tạo 1 triệu bản ghi giả lập
INSERT INTO tracks (title, artist_id, created_at, play_count)
SELECT
    CONCAT('Track ', n),
    FLOOR(RAND() * 10000) + 1,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
    FLOOR(RAND() * 1000000)
FROM (
    SELECT a.N + b.N * 10 + c.N * 100 + d.N * 1000 + e.N * 10000 + f.N * 100000 AS n
    FROM
        (SELECT 0 N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
        (SELECT 0 N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
         UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
        -- ... lặp tương tự đến f
) numbers
LIMIT 1000000;

-- Query KHÔNG có index (xóa index trước)
SELECT * FROM tracks WHERE title = 'Track 500000'; -- Full table scan

-- Thêm index
CREATE INDEX idx_title ON tracks(title);

-- Query CÓ index
SELECT * FROM tracks WHERE title = 'Track 500000'; -- Index scan

-- Xem execution plan
EXPLAIN SELECT * FROM tracks WHERE title = 'Track 500000';
```
**Ghi lại kết quả**: bao nhiêu ms không có index vs có index → đây là số liệu thực để nói trong interview.

---

### TUẦN 2: Query Optimization + Migrate Auth Module

#### Lý thuyết cần nắm
- **EXPLAIN**: Đọc `type` column — `ALL` = full scan (xấu), `ref`/`range`/`const` = dùng index (tốt). `rows` = số hàng MySQL ước tính phải đọc.
- **N+1 Problem**: Query 1 lần lấy danh sách → rồi query N lần nữa cho từng item. Phổ biến nhất với ORM.

#### Thực hành N+1 trong Melody Stream

```java
// ❌ Entity gây N+1
@Entity
public class Track {
    @ManyToOne(fetch = FetchType.LAZY) // LAZY = chưa load, khi gọi getArtist() mới query
    @JoinColumn(name = "artist_id")
    private Artist artist;
}

// ❌ Code gây N+1: 1 query lấy tracks + N query lấy từng artist
List<Track> tracks = trackRepository.findAll(); // Query 1
tracks.forEach(t -> System.out.println(t.getArtist().getName())); // N queries

// ✅ Fix bằng JPQL Fetch Join
@Query("SELECT t FROM Track t JOIN FETCH t.artist WHERE t.playCount > :minPlays")
List<Track> findPopularTracksWithArtist(@Param("minPlays") Long minPlays);

// ✅ Hoặc dùng @EntityGraph
@EntityGraph(attributePaths = {"artist", "album"})
List<Track> findByPlayCountGreaterThan(Long minPlays);
```

#### Migrate Auth Module (Spring Security + JWT)

```java
// JwtUtil.java
@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(SignatureAlgorithm.HS256, secret)
            .compact();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}
```

```java
// RefreshToken entity — migrate từ NestJS
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "device_id")
    private String deviceId;  // Migrate từ NestJS

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_revoked")
    private Boolean isRevoked = false;
}
```

**Index cần thêm cho RefreshToken:**
```java
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_rt_user_device", columnList = "user_id, device_id"),
    @Index(name = "idx_rt_token_hash", columnList = "token_hash"),
    @Index(name = "idx_rt_expires", columnList = "expires_at")
})
```

---

### TUẦN 3: Transactions + Migrate Upload/Streaming Flow

#### Lý thuyết cần nắm
- **ACID**: Atomicity (all or nothing), Consistency (constraints không bị vi phạm), Isolation (concurrent transactions không ảnh hưởng nhau), Durability (committed = không mất).
- **Isolation Levels** (từ thấp đến cao):
  - Read Uncommitted → đọc được dirty data
  - Read Committed → chỉ đọc committed (mặc định PostgreSQL)
  - Repeatable Read → same query = same result (mặc định MySQL InnoDB)
  - Serializable → tuần tự hoàn toàn, chậm nhất

#### Thực hành: Race Condition khi tăng play count

```java
// ❌ Race condition: 2 request đọc playCount=100 cùng lúc,
// cả 2 ghi 101 → mất 1 lần tăng
@Transactional
public void incrementPlayCount(Long trackId) {
    Track track = trackRepository.findById(trackId).orElseThrow();
    track.setPlayCount(track.getPlayCount() + 1); // Đọc rồi ghi
    trackRepository.save(track);
}

// ✅ Fix bằng Optimistic Locking
@Entity
public class Track {
    @Version  // Spring tự thêm WHERE version = ? khi UPDATE
    private Integer version;
}

// ✅ Hoặc Pessimistic Locking (lock row khi đọc)
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT t FROM Track t WHERE t.id = :id")
Optional<Track> findByIdWithLock(@Param("id") Long id);

// ✅ Hoặc đơn giản nhất: atomic update trong DB
@Modifying
@Query("UPDATE Track t SET t.playCount = t.playCount + 1 WHERE t.id = :id")
void incrementPlayCount(@Param("id") Long trackId);
```

#### Migrate Upload Flow (thay thế job queue NestJS)

```java
// TrackUploadService.java
@Service
public class TrackUploadService {

    @Async("trackProcessingExecutor") // Chạy async, không block HTTP response
    @Transactional
    public CompletableFuture<Void> processTrackUpload(Long trackId, MultipartFile file) {
        try {
            // 1. Cập nhật status = PROCESSING
            trackRepository.updateStatus(trackId, TrackStatus.PROCESSING);

            // 2. Lưu file gốc tạm thời
            Path tempFile = saveTempFile(file);

            // 3. Chạy FFmpeg convert sang HLS
            List<Path> hlsSegments = ffmpegService.convertToHLS(tempFile);

            // 4. Upload .m3u8 và .ts segments lên MinIO
            String m3u8Url = minioService.uploadHLSFiles(trackId, hlsSegments);

            // 5. Cập nhật status = READY + lưu URL
            trackRepository.updateStatusAndUrl(trackId, TrackStatus.READY, m3u8Url);

        } catch (Exception e) {
            trackRepository.updateStatus(trackId, TrackStatus.FAILED);
            throw new RuntimeException("Track processing failed", e);
        }

        return CompletableFuture.completedFuture(null);
    }
}
```

```java
// AsyncConfig.java — cấu hình thread pool cho job processing
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean("trackProcessingExecutor")
    public Executor trackProcessingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("track-processor-");
        executor.initialize();
        return executor;
    }
}
```

---

### TUẦN 4: Database Scaling + Hoàn thiện Core API

#### Lý thuyết cần nắm
- **Master-Slave Replication**: Master nhận ghi, Slave sync và nhận đọc. Async replication = nhanh hơn nhưng có replication lag. Sync = an toàn hơn nhưng chậm.
- **Sharding**: Chia data theo horizontal (theo user_id, region...). Phức tạp hơn nhiều — không cần làm thực tế ở giai đoạn này, hiểu khái niệm là đủ.

#### Docker Compose Master-Slave

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql-master:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: melody_stream
    volumes:
      - ./mysql/master.cnf:/etc/mysql/conf.d/master.cnf
    ports:
      - "3307:3306"

  mysql-slave:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
    volumes:
      - ./mysql/slave.cnf:/etc/mysql/conf.d/slave.cnf
    ports:
      - "3308:3306"
    depends_on:
      - mysql-master
```

```yaml
# application.yml — routing đọc/ghi
spring:
  datasource:
    master:
      url: jdbc:mysql://localhost:3307/melody_stream
      username: root
      password: password
    slave:
      url: jdbc:mysql://localhost:3308/melody_stream
      username: root
      password: password
```

```java
// RoutingDataSource.java — tự động route đọc → slave, ghi → master
public class RoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return TransactionSynchronizationManager.isCurrentTransactionReadOnly()
            ? "slave" : "master";
    }
}

// Dùng @Transactional(readOnly = true) cho read queries → tự động dùng slave
@Transactional(readOnly = true)
public List<TrackDto> getPopularTracks() {
    return trackRepository.findTopByPlayCount();
}
```

---

## THÁNG 7 — CACHING, NoSQL & LOAD TESTING

---

### TUẦN 1: Redis Cache + Stream API hoàn chỉnh

#### Lý thuyết cần nắm
- **Cache-aside**: App check cache trước, miss → query DB → lưu cache → trả về. Phổ biến nhất.
- **Write-through**: Ghi vào cache và DB đồng thời. Consistent hơn nhưng write chậm hơn.
- **Write-behind**: Ghi vào cache trước, async flush xuống DB sau. Write nhanh nhất, risk mất data.

#### Redis tích hợp vào Melody Stream

```java
// TrackCacheService.java
@Service
public class TrackCacheService {

    private static final String TRACK_KEY = "track:";
    private static final Duration TTL = Duration.ofMinutes(30);

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private TrackRepository trackRepository;

    // Cache-aside pattern
    public TrackDto getTrack(Long trackId) {
        String key = TRACK_KEY + trackId;

        // 1. Check cache
        TrackDto cached = (TrackDto) redisTemplate.opsForValue().get(key);
        if (cached != null) return cached;

        // 2. Cache miss → query DB
        TrackDto track = trackRepository.findById(trackId)
            .map(TrackDto::from)
            .orElseThrow(() -> new TrackNotFoundException(trackId));

        // 3. Lưu vào cache
        redisTemplate.opsForValue().set(key, track, TTL);

        return track;
    }

    public void invalidateTrack(Long trackId) {
        redisTemplate.delete(TRACK_KEY + trackId);
    }
}
```

**HLS Streaming endpoint:**
```java
@RestController
@RequestMapping("/api/tracks")
public class StreamingController {

    @GetMapping("/{trackId}/stream")
    public ResponseEntity<Resource> streamTrack(
            @PathVariable Long trackId,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {

        // Lấy m3u8 URL từ cache (hoặc DB)
        String m3u8Url = trackCacheService.getTrack(trackId).getM3u8Url();

        // Trả về .m3u8 manifest
        Resource resource = minioService.getResource(m3u8Url);
        return ResponseEntity.ok()
            .header("Content-Type", "application/vnd.apple.mpegurl")
            .body(resource);
    }
}
```

---

### TUẦN 2: Cache Resiliency + Security hoàn chỉnh

#### Lý thuyết cần nắm
- **Cache Penetration**: Query key không tồn tại trong cả cache lẫn DB → attacker có thể flood DB. Fix: cache giá trị null với TTL ngắn, hoặc Bloom Filter.
- **Cache Avalanche**: Nhiều key hết TTL cùng lúc → DB bị flood. Fix: random TTL offset.
- **Cache Stampede**: Cache miss xảy ra đồng thời nhiều request → tất cả đổ xuống DB cùng lúc. Fix: mutex lock.

#### Chống Cache Penetration bằng Bloom Filter

```java
// BloomFilterConfig.java
@Configuration
public class BloomFilterConfig {

    @Bean
    public RBloomFilter<Long> trackBloomFilter(RedissonClient redissonClient) {
        RBloomFilter<Long> bloomFilter = redissonClient.getBloomFilter("track:bloom");
        bloomFilter.tryInit(1_000_000L, 0.01); // 1M items, 1% false positive rate
        return bloomFilter;
    }
}

// TrackCacheService.java — thêm Bloom Filter check
public TrackDto getTrack(Long trackId) {
    // 1. Bloom Filter check — nếu không tồn tại → chắc chắn không có trong DB
    if (!trackBloomFilter.contains(trackId)) {
        throw new TrackNotFoundException(trackId); // Không cần query DB
    }

    String key = TRACK_KEY + trackId;
    TrackDto cached = (TrackDto) redisTemplate.opsForValue().get(key);
    if (cached != null) return cached;

    // 2. Cache miss với random TTL để tránh Avalanche
    TrackDto track = trackRepository.findById(trackId)
        .map(TrackDto::from)
        .orElseThrow(() -> new TrackNotFoundException(trackId));

    Duration randomTtl = TTL.plus(Duration.ofSeconds(new Random().nextInt(300)));
    redisTemplate.opsForValue().set(key, track, randomTtl);

    return track;
}
```

#### RBAC hoàn chỉnh (migrate từ NestJS)

```java
// Role và Permission
public enum Permission {
    TRACK_READ, TRACK_WRITE, TRACK_DELETE,
    PLAYLIST_READ, PLAYLIST_WRITE,
    ADMIN_ALL
}

@Entity
@Table(name = "roles")
public class Role {
    @Id
    private String name; // ROLE_USER, ROLE_ARTIST, ROLE_ADMIN

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_permissions")
    @Enumerated(EnumType.STRING)
    private Set<Permission> permissions;
}

// SecurityConfig.java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/tracks/**").hasAuthority("TRACK_READ")
            .requestMatchers(HttpMethod.POST, "/api/tracks/**").hasAuthority("TRACK_WRITE")
            .requestMatchers("/api/admin/**").hasAuthority("ADMIN_ALL")
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
```

---

### TUẦN 3: MongoDB cho Activity Log

#### Lý thuyết cần nắm
- **CAP Theorem**: Consistency, Availability, Partition Tolerance — chỉ đảm bảo được 2/3 khi có network partition. MySQL = CP, MongoDB = AP (eventually consistent).
- **Khi nào dùng NoSQL**: Schema thay đổi thường xuyên, write nhiều + read ít cần join, lưu log/event/activity.

#### Melody Stream: Lưu listening history vào MongoDB

```java
// ListeningEvent.java — MongoDB Document
@Document(collection = "listening_events")
public class ListeningEvent {
    @Id
    private String id;

    private Long userId;
    private Long trackId;
    private String trackTitle;
    private String artistName;

    private LocalDateTime listenedAt;
    private Integer durationSeconds; // Nghe được bao nhiêu giây
    private String deviceId;
    private String quality; // "high", "medium", "low" (HLS adaptive)

    // MongoDB linh hoạt — có thể thêm field mới bất cứ lúc nào
    // mà không cần migration
    private Map<String, Object> metadata; // flexible extra data
}

// ListeningEventRepository.java
public interface ListeningEventRepository extends MongoRepository<ListeningEvent, String> {
    List<ListeningEvent> findByUserIdOrderByListenedAtDesc(Long userId);

    @Aggregation(pipeline = {
        "{ $match: { userId: ?0 } }",
        "{ $group: { _id: '$trackId', count: { $sum: 1 } } }",
        "{ $sort: { count: -1 } }",
        "{ $limit: 10 }"
    })
    List<TrackPlayCount> findTopTracksForUser(Long userId);
}
```

**So sánh thực tế MySQL vs MongoDB cho use case này:**
- MySQL: cần schema cứng, mỗi lần thêm field phải ALTER TABLE (nặng với 100M rows)
- MongoDB: thêm field tự do, write throughput cao hơn, query aggregate pipeline mạnh cho analytics

---

### TUẦN 4: Load Testing + README hoàn chỉnh

#### Lab K6 cho Melody Stream

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 100 },   // Ramp up
        { duration: '3m', target: 1000 },  // Sustain
        { duration: '2m', target: 2000 },  // Peak load
        { duration: '1m', target: 0 },     // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% requests < 500ms
        http_req_failed: ['rate<0.01'],    // Error rate < 1%
    },
};

export default function () {
    // Test stream endpoint
    const trackId = Math.floor(Math.random() * 1000) + 1;
    const res = http.get(`http://localhost:8080/api/tracks/${trackId}/stream`, {
        headers: { 'Authorization': `Bearer ${__ENV.TEST_TOKEN}` }
    });

    check(res, {
        'status 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1);
}
```

**Chạy và ghi lại kết quả:**
```bash
k6 run --out json=results.json k6-load-test.js
```

Metrics cần ghi vào README:
- Max RPS đạt được trước khi latency tăng đột biến
- p50, p95, p99 latency
- Bottleneck ở đâu: CPU app, DB connection pool, hay MinIO I/O?

---

## CHECKLIST ĐỊNH NGHĨA HOÀN THÀNH (31/07/2026)

### Spring Boot Core
- [ ] IoC/DI: không còn `new` object service/repository thủ công
- [ ] Spring MVC: REST API đầy đủ CRUD + proper HTTP status codes
- [ ] Spring Data JPA + Hibernate: entities, relationships, custom queries
- [ ] Spring Security: JWT stateless, RBAC với permissions, refresh token + deviceId
- [ ] @Transactional: hiểu readOnly, isolation level, rollback

### Database
- [ ] Index đúng chỗ: có thể giải thích tại sao field nào cần index
- [ ] EXPLAIN: đọc được execution plan, biết khi nào là bad query
- [ ] N+1: phát hiện và fix được bằng Fetch Join hoặc EntityGraph
- [ ] Race condition: demo được lỗi + fix bằng @Version hoặc atomic update
- [ ] Docker Compose: chạy được MySQL Master-Slave

### Caching
- [ ] Redis: Cache-aside chạy đúng, TTL hợp lý
- [ ] Bloom Filter: chống cache penetration
- [ ] Random TTL: chống cache avalanche

### Project Melody Stream
- [ ] Auth flow: đăng ký, đăng nhập, refresh token, logout theo deviceId
- [ ] Upload + HLS processing: async job chạy đúng
- [ ] Stream endpoint: trả về .m3u8, HLS player play được
- [ ] MongoDB: lưu và query listening history
- [ ] Load test: có bảng kết quả thực với RPS + latency

### README (quan trọng như code)
- [ ] Architecture diagram (vẽ bằng draw.io hoặc Mermaid)
- [ ] Giải thích tại sao chọn HLS
- [ ] Flow: upload → FFmpeg → MinIO → stream
- [ ] Kết quả load test với số liệu cụ thể
- [ ] Hướng dẫn chạy local bằng Docker Compose

---

## PHÂN BỔ THỜI GIAN MỖI NGÀY

| Khung giờ | Hoạt động |
|-----------|-----------|
| 08:30 - 10:00 | LeetCode (2 bài theo pattern của tuần) |
| 10:00 - 11:30 | Đọc lý thuyết tuần này (B+Tree, Transactions, Redis...) |
| 13:30 - 17:30 | Code Melody Stream — áp dụng lý thuyết vừa đọc |
| 20:00 - 21:00 | Review lỗi gặp trong ngày, đọc thêm docs |

> **Quy tắc:** Gặp lỗi Spring không hiểu → đọc docs chính thức (docs.spring.io) trước, Stack Overflow sau, ChatGPT cuối cùng. Tự debug 20-30 phút trước khi hỏi — đây là kỹ năng quan trọng nhất trong interview.