# Báo cáo Thiết kế Kiến trúc và Triển khai Kỹ thuật: Hệ thống Đấu giá Trực tuyến Thời gian thực

Sự chuyển dịch của các mô hình giao dịch tài sản và sự bùng nổ của nền kinh tế kỹ thuật số đã thúc đẩy nhu cầu thiết kế các hệ thống đấu giá trực tuyến với quy mô và độ phức tạp ngày càng cao. Khác với các nền tảng thương mại điện tử truyền thống dựa trên mô hình định giá tĩnh (posted-price), một hệ thống đấu giá trực tuyến bản chất là một cỗ máy khớp lệnh thời gian thực, nơi giá trị của sản phẩm thay đổi liên tục dựa trên sức mua và chiến lược của người tham gia. Việc thiết kế một hệ thống như vậy không chỉ dừng lại ở việc tạo ra giao diện người dùng, mà đòi hỏi sự giải quyết triệt để các bài toán hóc búa về khoa học máy tính: kiểm soát tương tranh (concurrency control) dưới áp lực truy cập khổng lồ, duy trì tính nhất quán dữ liệu tuyệt đối (strong consistency) khi các giao dịch tài chính diễn ra trong vòng một phần nghìn giây, và đảm bảo tính công bằng thông qua các thuật toán chống thao túng.

Báo cáo này cung cấp một bản thiết kế toàn diện, sâu sắc và mang tính ứng dụng cao cho một hệ thống đấu giá trực tuyến chuyên nghiệp, dựa trên tài liệu nghiên cứu ban đầu và được mở rộng để đáp ứng các tiêu chuẩn công nghiệp khắt khe nhất. Hệ thống được thiết kế dựa trên kiến trúc phân lớp hiện đại, kết hợp **NestJS (dùng Fastify Adapter)** cho Backend và khả năng tối ưu hóa hiển thị của Next.js (App Router) cho Frontend. Bên cạnh đó, báo cáo sẽ phân tích và tích hợp các cơ chế nâng cao như hệ thống ví ký quỹ (Escrow Wallet) để đảm bảo thanh toán, thuật toán đặt giá ủy quyền (Proxy Bidding), và cơ chế chống bắn tỉa (Anti-sniping) để bảo vệ quyền lợi của người bán và người mua chân chính.

> **Cập nhật kỹ thuật (03/2026):** Backend được chuẩn hóa theo NestJS module architecture (thay cho mô hình Fastify plugin thuần), vẫn giữ nguyên các nguyên tắc hiệu năng/công bằng đã mô tả: OCC, Escrow, Anti-sniping, Proxy Bidding, Redis Pub/Sub và WebSocket realtime.

## 1. Chiến lược Kiến trúc Tổng thể và Lựa chọn Công nghệ

Kiến trúc của hệ thống đấu giá được định hình bởi các yêu cầu phi chức năng khắt khe: độ trễ của các API cập nhật giá phải duy trì dưới ngưỡng 300ms, hệ thống phải xử lý mượt mà hàng ngàn kết nối đồng thời trong những giây cuối cùng của phiên đấu giá, và tính toàn vẹn của dữ liệu tài chính không cho phép bất kỳ sai sót nào. Để đạt được các mục tiêu này, kiến trúc hệ thống được chia thành các tầng xử lý chuyên biệt, giao tiếp với nhau thông qua các giao thức tối ưu.

### 1.1. Tầng Máy chủ Backend (NestJS + Fastify Adapter & Node.js)

Trong môi trường Node.js, Fastify nổi lên như một sự lựa chọn ưu việt so với các framework truyền thống như Express, đặc biệt trong các kịch bản đòi hỏi hiệu năng cực cao. Các thử nghiệm tải thực tế chứng minh Fastify có thể xử lý từ 45.000 đến 50.000 yêu cầu mỗi giây (RPS), cao gấp 2 đến 3 lần so với Express. Sự vượt trội này bắt nguồn từ cấu trúc bộ định tuyến dựa trên cây Radix (trie-based router) có độ phức tạp O(k) và cơ chế biên dịch lược đồ xác thực (schema-driven validation) tại thời điểm khởi động. Fastify sử dụng thư viện Ajv để biên dịch các JSON Schema thành các hàm JavaScript thuần túy, loại bỏ chi phí xác thực động và bảo vệ máy chủ khỏi các cuộc tấn công từ chối dịch vụ (DoS) thông qua payload độc hại.

Bên cạnh hiệu năng, NestJS bổ sung một lớp tổ chức ở cấp ứng dụng thông qua **Module/Controller/Provider**, giúp chuẩn hóa Dependency Injection, phân tách bounded context theo domain (Auth, Wallet, Product, Bid, Admin), và đơn giản hóa mở rộng sang kiến trúc Microservices. Fastify được dùng như HTTP engine thông qua `@nestjs/platform-fastify`, giữ lợi thế tốc độ đồng thời tăng khả năng bảo trì ở quy mô lớn.

### 1.2. Tầng Giao diện Frontend (Next.js App Router)

Next.js (từ phiên bản 14 trở lên) với kiến trúc App Router được lựa chọn làm nền tảng phát triển giao diện người dùng. Sự kết hợp giữa Server Components (RSC) và Client Components mang lại lợi thế kép. Đối với các trang danh mục sản phẩm hoặc trang chủ, SSR (Server-Side Rendering) được sử dụng để tối ưu hóa SEO và giảm thiểu Thời gian hiển thị nội dung đầu tiên (First Contentful Paint), trong khi các khu vực đòi hỏi tương tác thời gian thực cao như bảng điều khiển đặt giá được nhúng như Client Components để duy trì kết nối WebSocket.Mô hình định tuyến dựa trên thư mục của Next.js cho phép phân tách rõ ràng các nhóm người dùng (Admin, Seller, Bidder) thông qua tính năng Route Groups, giúp tái sử dụng các bố cục (layouts) mà không làm phức tạp hóa cấu trúc URL.

### 1.3. Cơ sở hạ tầng Thời gian thực (WebSockets & Redis Pub/Sub)

Trong một phiên đấu giá, việc cập nhật giá trị thầu (bid) phải được phản ánh ngay lập tức trên màn hình của tất cả những người tham gia. Giao thức HTTP truyền thống với cơ chế yêu cầu-phản hồi (request-response) hoặc kỹ thuật thăm dò ý kiến (long-polling) sẽ tạo ra độ trễ không thể chấp nhận được và làm cạn kiệt tài nguyên máy chủ. Do đó, WebSockets được sử dụng để duy trì một kết nối song công (full-duplex) liên tục.

Tuy nhiên, khi hệ thống mở rộng theo chiều ngang với nhiều máy chủ Backend (Horizontal Scaling), một người dùng đặt giá trên Máy chủ A sẽ không thể trực tiếp thông báo cho những người dùng đang kết nối với Máy chủ B. Để giải quyết rào cản này, Redis Pub/Sub được tích hợp như một xương sống truyền tin (message backbone). Bất kỳ sự kiện đặt giá mới nào cũng được phát (publish) lên một kênh Redis, và tất cả các máy chủ đều đăng ký (subscribe) kênh này để nhận và chuyển tiếp thông điệp xuống các máy khách WebSocket của riêng chúng, đảm bảo tính đồng bộ toàn cầu với độ trễ dưới 100ms.

## 2. Thiết kế Lược đồ Cơ sở Dữ liệu (Database Schema) Chuyên sâu

Dữ liệu là cốt lõi của bất kỳ hệ thống đấu giá nào. Một lược đồ cơ sở dữ liệu yếu kém sẽ dẫn đến tình trạng khóa chéo (deadlocks), dữ liệu không nhất quán và sụp đổ dưới tải trọng cao. Cơ sở dữ liệu quan hệ (PostgreSQL) được lựa chọn để đảm bảo tuyệt đối các thuộc tính ACID (Atomicity, Consistency, Isolation, Durability) cho các giao dịch tài chính. Lược đồ ban đầu đã được tái cấu trúc và mở rộng thành 11 bảng, tuân thủ nghiêm ngặt các nguyên tắc chuẩn hóa và thiết kế khóa ngoại. Các bảng được trình bày theo thứ tự phụ thuộc để đảm bảo quá trình di chuyển dữ liệu (migration) không gặp lỗi.

### 2.1. Nhóm Quản lý Người dùng, Phân quyền và Tài chính

Hệ thống nhận dạng người dùng không chỉ dừng lại ở việc lưu trữ thông tin xác thực, mà còn phải bao gồm các hệ thống đánh giá uy tín và quản lý tài chính để ngăn chặn gian lận và rủi ro thanh toán.#### Bảng users (Quản lý Định danh & Uy tín)

Việc duy trì thông tin người dùng được kết hợp với một hệ thống điểm uy tín (Reputation System) nhằm định lượng độ tin cậy của mỗi tài khoản.

| Tên trường       | Kiểu dữ liệu | Ràng buộc và Ghi chú Kỹ thuật                                       |
| ---------------- | ------------ | ------------------------------------------------------------------- | ------------------------------------------------ |
| id               | UUID         | Khóa chính (PK), sinh tự động bằng hàm gen_random_uuid() để bảo mật |
| email            | VARCHAR(255) | Trực thuộc chỉ mục UNIQUE INDEX, bắt buộc để đăng nhập              |
| password_hash    | VARCHAR(255) | Chuỗi băm mật khẩu sử dụng thuật toán Argon2 hoặc Bcrypt            |
| full_name        | VARCHAR(255) | Tên hiển thị công khai trên nền tảng                                |
| phone_number     | VARCHAR(20)  | Tùy chọn, phục vụ cho xác thực đa yếu tố (MFA)                      |
| role             | ENUM         | Giới hạn trong ba giá trị: ADMIN, SELLER, BIDDER                    |
| status           | ENUM         | Các trạng thái: UNVERIFIED, ACTIVE, SUSPENDED, BANNED               |
| reputation_score | DECIMAL(3,2) | Điểm uy tín từ 1.0 đến 5.0, giá trị mặc định là 5.0                 |
| created_at       | TIMESTAMP    | Thời điểm khởi tạo tài khoản                                        |
| updated_at       | TIMESTAMP    | Cập nhật tự động thông qua trigger của cơ sở dữ liệu####            | Bảng wallets (Ví Điện tử Ký quỹ - Escrow Wallet) |

Vấn nạn lớn nhất của đấu giá trực tuyến là hiện tượng người dùng trả giá cao để chiến thắng nhưng từ chối thanh toán (Winner Default). Bảng wallets triển khai cơ chế ký quỹ nội bộ (Escrow) để giải quyết triệt để rủi ro này.

| Tên trường        | Kiểu dữ liệu  | Ràng buộc và Ghi chú Kỹ thuật                                                  |
| ----------------- | ------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| id                | UUID          | Khóa chính (PK)                                                                |
| user_id           | UUID          | Khóa ngoại (FK) tham chiếu users.id, ràng buộc UNIQUE (Mỗi người 1 ví)         |
| available_balance | DECIMAL(15,2) | Số tiền khả dụng mà người dùng có thể rút hoặc dùng để đặt giá                 |
| held_balance      | DECIMAL(15,2) | Số tiền đang bị phong tỏa (ký quỹ) khi người dùng đang giữ vị trí giá cao nhất |
| currency          | VARCHAR(3)    | Mã tiền tệ theo tiêu chuẩn ISO 4217 (Ví dụ: 'USD', 'VND')                      |
| last_updated      | TIMESTAMP     | Ghi nhận thời điểm thay đổi số dư gần nhất####                                 | Bảng wallet_transactions (Sổ cái Giao dịch) |

Mọi luồng di chuyển tài chính đều được ghi nhận vĩnh viễn trong bảng này để phục vụ kiểm toán (Auditing) và đối soát kế toán.

| Tên trường       | Kiểu dữ liệu  | Ràng buộc và Ghi chú Kỹ thuật                                         |
| ---------------- | ------------- | --------------------------------------------------------------------- |
| id               | UUID          | Khóa chính (PK)                                                       |
| wallet_id        | UUID          | Khóa ngoại (FK) tham chiếu wallets.id, đánh chỉ mục để truy vấn nhanh |
| transaction_type | ENUM          | Phân loại: DEPOSIT, WITHDRAW, HOLD, RELEASE, PAYMENT                  |
| amount           | DECIMAL(15,2) | Giá trị giao dịch (luôn lưu giá trị tuyệt đối, dương)                 |
| reference_type   | VARCHAR(50)   | Xác định bối cảnh: BID, ORDER, SYSTEM_TOPUP                           |
| reference_id     | UUID          | Khóa ngoại logic tham chiếu đến ID của Bid hoặc Order tương ứng       |
| status           | ENUM          | Trạng thái xử lý: PENDING, COMPLETED, FAILED                          |
| created_at       | TIMESTAMP     | Thời điểm phát sinh giao dịch                                         |

### 2.2. Nhóm Sản phẩm và Cấu hình Phiên Đấu giá |

Thực thể cốt lõi mang tính quyết định là bảng products. Nó không chỉ lưu trữ thông tin sản phẩm mà còn chứa cấu hình định hình các quy tắc kinh tế vi mô của phiên đấu giá.#### Bảng categories (Hệ thống Danh mục)

| Tên trường  | Kiểu dữ liệu | Ràng buộc và Ghi chú Kỹ thuật                                     |
| ----------- | ------------ | ----------------------------------------------------------------- | ---------------------------------------------------- |
| id          | UUID         | Khóa chính (PK)                                                   |
| parent_id   | UUID         | Khóa ngoại đệ quy tham chiếu categories.id để tạo danh mục đa cấp |
| name        | VARCHAR(100) | Tên danh mục, ràng buộc UNIQUE kết hợp với parent_id              |
| description | TEXT         | Mô tả chi tiết về đặc điểm danh mục####                           | Bảng products (Sản phẩm và Cấu trúc Đấu giá cốt lõi) |

Bảng này được thiết kế tinh vi để hỗ trợ các cơ chế chống bắn tỉa (Anti-sniping) và kiểm soát tương tranh lạc quan (Optimistic Concurrency Control).

| Tên trường           | Kiểu dữ liệu  | Ràng buộc và Ghi chú Kỹ thuật                                                        |
| -------------------- | ------------- | ------------------------------------------------------------------------------------ |
| id                   | UUID          | Khóa chính (PK)                                                                      |
| seller_id            | UUID          | Khóa ngoại tham chiếu users.id, đánh chỉ mục truy vấn                                |
| category_id          | UUID          | Khóa ngoại tham chiếu categories.id                                                  |
| title                | VARCHAR(255)  | Tiêu đề sản phẩm hiển thị                                                            |
| description          | TEXT          | Nội dung mô tả chi tiết, hỗ trợ lưu trữ định dạng Markdown hoặc HTML                 |
| start_price          | DECIMAL(15,2) | Mức giá khởi điểm do người bán quy định                                              |
| current_price        | DECIMAL(15,2) | Giá thầu cao nhất hiện hành. Thiết kế phi chuẩn hóa (denormalized) để đọc nhanh      |
| reserve_price        | DECIMAL(15,2) | Giá tối thiểu ẩn. Nếu giá cuối cùng không vượt mức này, hàng sẽ không được bán       |
| bid_increment        | DECIMAL(10,2) | Bước giá tối thiểu bắt buộc cho mỗi lần đặt giá tiếp theo                            |
| start_time           | TIMESTAMP     | Thời điểm chính thức mở nhận giá thầu                                                |
| end_time             | TIMESTAMP     | Thời điểm kết thúc dự kiến ban đầu                                                   |
| effective_end_time   | TIMESTAMP     | Thời gian kết thúc thực tế. Cập nhật động bởi cơ chế Anti-Sniping                    |
| anti_sniping_trigger | INT           | Biên độ thời gian (tính bằng giây) trước khi kết thúc để kích hoạt kéo dài (VD: 60s) |
| anti_sniping_extend  | INT           | Thời lượng gia hạn thêm (tính bằng giây) nếu trigger được kích hoạt                  |
| status               | ENUM          | Trạng thái vòng đời: DRAFT, SCHEDULED, ACTIVE, ENDED, SOLD, UNSOLD                   |
| version              | INT           | Biến đếm phục vụ Khóa lạc quan (Optimistic Locking). Mặc định là 1                   |
| created_at           | TIMESTAMP     | Thời điểm tạo bản ghi                                                                |

### 2.3. Nhóm Giao dịch Xử lý Lệnh (Bids & Orders) |

#### Bảng bids (Nhật ký Trả giá và Proxy Bidding)

Sự phức tạp của cơ chế đấu giá nằm ở bảng bids. Đây là một nhật ký chỉ ghi (append-only audit log) cung cấp bằng chứng pháp lý và nguồn sự thật duy nhất (source of truth) cho mọi hành động tài chính.

| Tên trường       | Kiểu dữ liệu  | Ràng buộc và Ghi chú Kỹ thuật                                                                    |
| ---------------- | ------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| id               | UUID          | Khóa chính (PK)                                                                                  |
| product_id       | UUID          | Khóa ngoại tham chiếu products.id, tạo chỉ mục ghép (Composite Index) cùng server_timestamp      |
| bidder_id        | UUID          | Khóa ngoại tham chiếu users.id                                                                   |
| bid_amount       | DECIMAL(15,2) | Mức giá hiện tại mong muốn đặt                                                                   |
| max_auto_bid     | DECIMAL(15,2) | Giá trị tối đa ủy quyền cho hệ thống Proxy Bidding tự động đẩy giá                               |
| status           | ENUM          | WINNING, OUTBID, RETRACTED (Trạng thái được cập nhật khi có bid mới cao hơn)                     |
| server_timestamp | TIMESTAMP     | Thời gian thực nhận tại máy chủ. Cực kỳ quan trọng để giải quyết tranh chấp phần nghìn giây #### | Bảng orders (Quản lý Đơn hàng Hậu Đấu giá) |

Khi quá trình đếm ngược kết thúc và vượt qua ngưỡng reserve_price, hệ thống tự động sinh ra một đơn hàng để quản lý quy trình thanh toán và giao nhận.

| Tên trường     | Kiểu dữ liệu  | Ràng buộc và Ghi chú Kỹ thuật                                              |
| -------------- | ------------- | -------------------------------------------------------------------------- |
| id             | UUID          | Khóa chính (PK)                                                            |
| product_id     | UUID          | Khóa ngoại tham chiếu products.id, ràng buộc UNIQUE (Quan hệ 1-1)          |
| seller_id      | UUID          | Khóa ngoại tham chiếu users.id (Người bán)                                 |
| buyer_id       | UUID          | Khóa ngoại tham chiếu users.id (Người chiến thắng)                         |
| winning_bid_id | UUID          | Khóa ngoại tham chiếu bids.id để lưu vết căn cứ chốt đơn                   |
| final_price    | DECIMAL(15,2) | Tổng số tiền phải thanh toán                                               |
| platform_fee   | DECIMAL(15,2) | Khoản hoa hồng trích lại cho nền tảng                                      |
| status         | ENUM          | Tiến trình: PENDING_PAYMENT, PAYMENT_SECURED, SHIPPED, COMPLETED, DISPUTED |
| created_at     | TIMESTAMP     | Thời điểm tạo hóa đơn                                                      |

### 2.4. Nhóm Tương tác, Đánh giá và Hệ thống Giám sát |

Hệ sinh thái thương mại không thể tồn tại thiếu cơ chế đánh giá và giải quyết tranh chấp.#### Bảng reviews (Đánh giá Hệ sinh thái)

| Tên trường     | Kiểu dữ liệu | Ràng buộc và Ghi chú Kỹ thuật                                      |
| -------------- | ------------ | ------------------------------------------------------------------ | ---------------------------------------- |
| id             | UUID         | Khóa chính (PK)                                                    |
| order_id       | UUID         | Khóa ngoại tham chiếu orders.id                                    |
| reviewer_id    | UUID         | Khóa ngoại tham chiếu users.id                                     |
| target_user_id | UUID         | Khóa ngoại tham chiếu users.id. Phục vụ tính điểm reputation_score |
| rating         | TINYINT      | Giá trị phân loại từ 1 đến 5 sao                                   |
| comment        | TEXT         | Chi tiết phản hồi bằng văn bản####                                 | Bảng messages (Kênh Giao tiếp Trực tiếp) |

Hỗ trợ trao đổi giữa người mua và người bán sau khi đấu giá thành công hoặc hỏi đáp về sản phẩm.

| Tên trường  | Kiểu dữ liệu | Ràng buộc và Ghi chú Kỹ thuật                                        |
| ----------- | ------------ | -------------------------------------------------------------------- | -------------------------------------------- |
| id          | UUID         | Khóa chính (PK)                                                      |
| sender_id   | UUID         | Khóa ngoại tham chiếu users.id                                       |
| receiver_id | UUID         | Khóa ngoại tham chiếu users.id                                       |
| product_id  | UUID         | Khóa ngoại tham chiếu products.id, định danh ngữ cảnh cuộc hội thoại |
| content     | TEXT         | Nội dung tin nhắn                                                    |
| is_read     | BOOLEAN      | Trạng thái hiển thị tin nhắn chưa đọc####                            | Bảng reports (Báo cáo Vi phạm và Kiểm duyệt) |

| Tên trường    | Kiểu dữ liệu | Ràng buộc và Ghi chú Kỹ thuật                                         |
| ------------- | ------------ | --------------------------------------------------------------------- | ------------------------------------------------- |
| id            | UUID         | Khóa chính (PK)                                                       |
| reporter_id   | UUID         | Khóa ngoại tham chiếu users.id                                        |
| reported_user | UUID         | Khóa ngoại tham chiếu users.id                                        |
| product_id    | UUID         | Khóa ngoại tham chiếu products.id (Cho phép NULL nếu báo cáo cá nhân) |
| reason        | VARCHAR(255) | Phân loại vi phạm (hàng giả, lừa đảo, trả giá ảo)                     |
| status        | ENUM         | Tiến trình xử lý: PENDING, INVESTIGATING, RESOLVED, DISMISSED####     | Bảng audit_logs (Nhật ký Hệ thống Chống Gian lận) |

Một cơ sở dữ liệu chuyên ngành cần có khả năng truy xuất lịch sử thay đổi để phục vụ kiểm toán và phát hiện bất thường.

| Tên trường    | Kiểu dữ liệu | Ràng buộc và Ghi chú Kỹ thuật                                                                                                            |
| ------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| id            | UUID         | Khóa chính (PK)                                                                                                                          |
| entity_type   | VARCHAR(50)  | Xác định bảng bị thay đổi: USER, PRODUCT, BID, ORDER                                                                                     |
| entity_id     | UUID         | Định danh thực thể bị tác động                                                                                                           |
| action_type   | VARCHAR(50)  | Hành vi: CREATE, UPDATE, DELETE, STATUS_ALTER                                                                                            |
| performed_by  | UUID         | Người dùng hoặc hệ thống thực hiện                                                                                                       |
| delta_changes | JSONB        | Cấu trúc dữ liệu JSON lưu trữ sự khác biệt giữa giá trị Cũ và Mới. Sử dụng JSONB của PostgreSQL để lập chỉ mục tìm kiếm văn bản toàn văn |
| timestamp     | TIMESTAMP    | Thời gian ghi nhận sự kiện                                                                                                               |

## 3. Kiến trúc Luồng Logic Kinh doanh và Giải quyết Thách thức Hệ thống |

Bảng dữ liệu chỉ là nền tảng tĩnh. Sự ưu việt của hệ thống được chứng minh thông qua cách xử lý các bài toán nghiệp vụ phức tạp ở tốc độ cao.

### 3.1. Giải quyết Tình trạng Tương tranh Bằng Khóa Lạc quan (Optimistic Concurrency Control)

Một thách thức kinh điển của hệ thống đấu giá là hiện tượng "Cạnh tranh dữ liệu" (Race Condition). Giả sử giá hiện tại của sản phẩm X là $500. Người dùng A và Người dùng B cùng nhấp chuột đặt giá $600 trong cùng một phần nghìn giây. Nếu cơ sở dữ liệu xử lý không tốt, giao dịch của B có thể ghi đè lên giao dịch của A, dẫn đến hiện tượng "Mất cập nhật" (Lost Update) và biến cả hai thành người chiến thắng ảo.

Việc sử dụng Khóa bi quan (Pessimistic Locking qua SELECT... FOR UPDATE) có thể ngăn chặn điều này bằng cách khóa toàn bộ bản ghi cho đến khi một giao dịch hoàn tất. Tuy nhiên, trong môi trường truy cập cao, phương pháp này sẽ gây ra tình trạng thắt cổ chai, khóa chéo (deadlocks) và làm giảm nghiêm trọng hiệu suất.

Báo cáo này đề xuất sử dụng Khóa Lạc quan (Optimistic Concurrency Control - OCC) thông qua trường version trong bảng products. Logic xử lý diễn ra như sau:Máy chủ đọc trạng thái hiện tại: current_price = $500, version = 10.

Khi người dùng A đặt giá $600, Backend phát lệnh SQL:UPDATE products SET current_price = 600, version = 11 WHERE id = 'X' AND version = 10;

Nếu người dùng B cũng đặt giá $600 cùng thời điểm, cơ sở dữ liệu sẽ xử lý lệnh của B ngay sau A. Tuy nhiên, lúc này version đã là 11. Câu lệnh UPDATE... WHERE version = 10 của B sẽ thất bại và không có hàng nào bị ảnh hưởng (0 rows affected).Backend phát hiện sự thay đổi, ném ra lỗi xung đột (Conflict) cho B, yêu cầu Client của B tải lại giá trị mới nhất. Phương pháp này đảm bảo tính toàn vẹn dữ liệu tuyệt đối mà không cần duy trì các khóa cơ sở dữ liệu tốn kém tài nguyên.

Để gia tăng khả năng mở rộng, hệ thống cũng có thể tích hợp mô hình xử lý chuỗi qua hàng đợi Amazon SQS FIFO hoặc Apache Kafka, biến các thao tác song song thành xử lý tuần tự theo thời gian thực để loại bỏ hoàn toàn tranh chấp tài nguyên mức cơ sở dữ liệu.

### 3.2. Quản lý Tài chính qua Ví Ký quỹ (Escrow Management)

Mô hình Escrow được nhúng trực tiếp vào kiến trúc để loại trừ rủi ro thao túng thị trường và không thanh toán. Khi một người dùng tham gia đấu giá, họ không chỉ cam kết bằng lời nói. Thuật toán hoạt động như sau:Người dùng A muốn đặt giá $1,000. Hệ thống kiểm tra bảng wallets. Nếu available_balance >= $1,000, giao dịch được chấp thuận.

Một thao tác Transaction chuẩn ACID được thực thi: Trừ $1,000 từ available_balance và chuyển vào held_balance của Người dùng A. Trạng thái của lệnh đặt giá là WINNING.

Vài phút sau, Người dùng B đặt mức giá $1,100. Hệ thống đóng băng $1,100 trong ví của B. Đồng thời, trạng thái của lệnh đặt giá của A chuyển thành OUTBID. Quan trọng nhất, hệ thống tự động sinh một giao dịch RELEASE để chuyển hoàn $1,000 từ held_balance về lại available_balance cho A, cho phép A ngay lập tức mang số tiền này đi đấu giá sản phẩm khác.

Khi thời gian kết thúc, số tiền $1,100 của B sẽ chính thức bị khấu trừ thành doanh thu và chuyển cho người bán thông qua một giao dịch PAYMENT. Sự tích hợp giữa logic đấu giá và sổ cái tài chính này là điểm tựa kiến tạo niềm tin cho toàn bộ nền tảng.

### 3.3. Thuật toán Chống Bắn tỉa (Anti-Sniping) và Mở rộng Động

Hành vi "Bắn tỉa" (Sniping) là việc người dùng sử dụng phần mềm tự động (bot) hoặc chờ đến giây thứ 2 trước khi phiên đấu giá khép lại để tung ra mức giá cao nhất. Điều này khiến những người đặt giá khác không còn đủ thời gian phản ứng, gây ra sự ức chế tâm lý và làm mất đi giá trị tối đa tiềm năng của sản phẩm đối với người bán.Hệ thống vô hiệu hóa chiến thuật này bằng trường effective_end_time và anti_sniping_trigger trong bảng products. Giả sử anti_sniping_trigger = 60s và anti_sniping_extend = 120s:
Nếu một lệnh trả giá hợp lệ được tiếp nhận vào hệ thống khi khoảng cách giữa server_timestamp và effective_end_time nhỏ hơn 60 giây, máy chủ sẽ tự động cập nhật effective_end_time = server_timestamp + 120 giây. Quá trình này sẽ diễn ra liên tục, tạo thành hiệu ứng "Soft Close", mô phỏng lại tiếng gõ búa đếm ngược ba lần của các nhà đấu giá chuyên nghiệp truyền thống. Nó bắt buộc người dùng tham gia vào cuộc chiến giá công khai thay vì dựa vào thủ thuật căn giờ.

### 3.4. Đấu giá Ủy quyền (Proxy Bidding)

Mô hình Proxy Bidding giải phóng người mua khỏi việc phải liên tục giám sát màn hình. Người dùng chỉ cần nhập số tiền tối đa họ sẵn sàng chi trả (max_auto_bid trong bảng bids).
Thuật toán nội bộ của máy chủ sẽ đóng vai trò như một người đại diện. Ví dụ, giá hiện tại là $500 (bước giá $25). Người dùng A thiết lập max_auto_bid = $1,000. Hệ thống chỉ ghi nhận giá thầu công khai của A là $525. Nếu Người dùng B đặt $600, thuật toán sẽ tự động kiểm tra max_auto_bid của A và lập tức phản đòn bằng cách đặt giá $625 thay cho A. Chỉ khi một người dùng khác đặt vượt mức $1,000, A mới thực sự mất quyền dẫn đầu và nhận thông báo yêu cầu tăng ngưỡng ngân sách. Toàn bộ chuỗi sự kiện này diễn ra tại cấp độ bộ nhớ (in-memory) của máy chủ Backend, loại bỏ hoàn toàn độ trễ mạng và đảm bảo độ chính xác tuyệt đối.

## 4. Kiến trúc API Backend Dựa trên NestJS (Fastify Adapter)

Để triển khai các thuật toán trên, Backend sử dụng NestJS kết hợp TypeScript và Fastify Adapter. Hệ thống được phân mảnh theo mô hình Module thay vì Monolithic Controller: mỗi domain (`AuthModule`, `WalletsModule`, `ProductsModule`, `BidsModule`, `AdminModule`) đóng gói routes, providers và validation riêng. Cách tổ chức này giúp cô lập nghiệp vụ, chuẩn hóa DI và nâng cao hiệu quả unit/integration testing.

### 4.1. Cấu trúc Điểm cuối RESTful (REST Endpoints)

Các API được thiết kế tuân theo tiêu chuẩn RESTful, sử dụng các phương thức HTTP thích hợp và trả về mã trạng thái chuẩn. Bảo mật RBAC được tích hợp thông qua các vòng lặp xử lý (Hooks) preHandler của Fastify.#### Module Phân hệ Người dùng và Tài chính (User & Wallet Management)

Các API này cung cấp khả năng tự quản lý định danh và dòng tiền, được bảo vệ bởi middleware xác thực JWT.

| Phương thức HTTP | Endpoint (URI Path)     | Yêu cầu Quyền (Role) | Chức năng và Mô tả Chi tiết                                                                                            |
| ---------------- | ----------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| POST             | /api/v1/auth/register   | Công khai            | Nhận thông tin, băm mật khẩu, tạo bản ghi tại users và sinh ví trống tại wallets.                                      |
| POST             | /api/v1/auth/login      | Công khai            | Xác thực thông tin, tạo và trả về Access Token (JWT) ngắn hạn và Refresh Token lưu trữ qua HTTP-Only Cookie.           |
| GET              | /api/v1/wallets/me      | Mọi user đã Auth     | Truy xuất thông tin số dư (available_balance và held_balance) của người dùng hiện tại.                                 |
| POST             | /api/v1/wallets/deposit | Mọi user đã Auth     | Tiếp nhận payload nạp tiền, giao tiếp với Webhook của Cổng thanh toán (Stripe/PayPal), và tạo wallet_transactions.#### | Module Quản lý Đấu giá và Danh mục (Product & Auction Management) |

Cho phép người bán liệt kê sản phẩm và hệ thống thiết lập các tham số khống chế thời gian.

| Phương thức HTTP | Endpoint (URI Path)  | Yêu cầu Quyền (Role) | Chức năng và Mô tả Chi tiết                                                                                                                                          |
| ---------------- | -------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| GET              | /api/v1/products     | Công khai            | Trả về danh sách sản phẩm đấu giá. Hỗ trợ phân trang (Pagination), tìm kiếm theo từ khóa, lọc theo category_id và status (Active, Scheduled).                        |
| POST             | /api/v1/products     | SELLER, ADMIN        | Đăng sản phẩm mới. Yêu cầu nhập liệu bắt buộc đối với start_price, bid_increment, và end_time thông qua cấu trúc JSON Schema được xác thực gắt gao bởi thư viện Ajv. |
| GET              | /api/v1/products/:id | Công khai            | Truy xuất chi tiết sản phẩm, mức giá hiện hành và cấu hình chống bắn tỉa.                                                                                            |
| PUT              | /api/v1/products/:id | SELLER               | Cập nhật thông tin. Hook bảo mật sẽ chặn thao tác nếu sản phẩm đã bước vào trạng thái ACTIVE (đã bắt đầu nhận giá thầu).####                                         | Module Xử lý Lõi: Giao dịch Đấu giá (Core Bidding API) |

Đây là trái tim của hệ thống, đòi hỏi hiệu năng cao và giải quyết tranh chấp thông qua Optimistic Locking.

| Phương thức HTTP | Endpoint (URI Path) | Yêu cầu Quyền (Role) | Chức năng và Mô tả Chi tiết                                                                                                                                                                                                                             |
| ---------------- | ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| GET              | /products/:id/bids  | Công khai            | Hiển thị lịch sử đấu giá công khai. Ẩn thông tin nhạy cảm của người đặt giá (hiển thị ẩn danh dạng User\*\*\*123) để bảo vệ quyền riêng tư.                                                                                                             |
| POST             | /products/:id/bids  | BIDDER               | Chấp nhận Payload: { bid_amount: number, max_auto_bid?: number }. API thực hiện 3 bước Transaction: Xác minh số dư Ví -> Áp dụng Optimistic Lock cập nhật products -> Sinh giao dịch bids. Nếu thất bại do tương tranh, trả về mã lỗi 409 Conflict.#### | Module Quản trị và Xử lý Vi phạm (Admin & Resolution API) |

Các chức năng kiểm soát toàn vẹn hệ thống và can thiệp thủ công từ Ban quản trị.

| Phương thức HTTP | Endpoint (URI Path)   | Yêu cầu Quyền (Role) | Chức năng và Mô tả Chi tiết                                                                                                                                                                                                   |
| ---------------- | --------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET              | /api/v1/admin/users   | ADMIN                | Phân tích toàn diện, bao gồm reputation_score và lịch sử báo cáo.PUT/admin/users/:id/banADMINĐình chỉ tài khoản gian lận. Lập tức hủy bỏ toàn bộ các bids đang hoạt động của tài khoản này và cập nhật lại bảng xếp hạng giá. |
| GET              | /api/v1/admin/reports | ADMIN                | Truy xuất danh sách khiếu nại chưa xử lý từ bảng reports.                                                                                                                                                                     |

### |4.2. Kiến trúc Hạ tầng Thời gian thực (WebSocket & Pub/Sub)

Trong môi trường NestJS, sự kiện thời gian thực được xử lý qua `@nestjs/websockets` (Socket.IO Gateway) tích hợp cùng vòng đời ứng dụng. Tuy nhiên, để đảm bảo tính sẵn sàng cao (High Availability), hệ thống không thể hoạt động trên một phiên bản Node.js duy nhất. Sự phối hợp giữa WebSocket Gateway và Redis Pub/Sub tạo ra mô hình Phát hành-Đăng ký (Publish-Subscribe) vô cùng mạnh mẽ. Kiến trúc được vận hành như sau: mỗi khi một yêu cầu POST /products/:id/bids hoàn tất và lưu vào PostgreSQL, service sẽ phát JSON payload qua `redis.publish('auction_channel', payload)`.

Gói tin này chứa thông tin về product_id, new_price, và sự thay đổi về effective_end_time (nếu kích hoạt Anti-sniping).

Tất cả các máy chủ trong cụm (Bao gồm Node A, Node B, Node C) đều đang đăng ký lắng nghe (subscribe) auction_channel thông qua đối tượng redis.on('message', handler).

Khi nhận được thông điệp, mỗi Node sẽ tìm kiếm trong bộ nhớ cục bộ danh sách các ổ cắm (sockets) của người dùng đang theo dõi product_id đó, và ngay lập tức đẩy (push) dữ liệu nhị phân hoặc chuỗi qua đường truyền WebSocket về trình duyệt của khách hàng. Phương pháp này giúp phân tán tải và đảm bảo tất cả người dùng, dù kết nối tới máy chủ vật lý nào, đều nhận được thông tin đồng bộ tại cùng một phần nghìn giây.

## 5. Kiến trúc Giao diện Frontend Hệ thống (Next.js App Router)

Next.js với mô hình App Router tạo ra một cấu trúc thư mục (Directory Structure) mạnh mẽ, gắn chặt quy hoạch file vật lý với trải nghiệm luồng giao diện người dùng (Routing). Kiến trúc này hỗ trợ song song các tính năng Tối ưu hóa Công cụ Tìm kiếm (SEO) cho các mặt hàng công khai thông qua SSR (Server-Side Rendering) và giao diện điều khiển phong phú thông qua CSR (Client-Side Rendering) cho tính năng đặt giá tương tác.

### 5.1. Thiết kế Thư mục Dựa trên Vai trò (Role-Based Directory Design)

Sử dụng tính năng Route Groups (Bọc tên thư mục bằng dấu ngoặc đơn), kiến trúc chia ứng dụng thành các khu vực bị cô lập về mặt bố cục và quyền truy cập nhưng vẫn giữ nguyên đường dẫn URL gọn gàng.nextjs-auction-frontend/├── src/│ ├── app/│ │ ├── (public)/ # Khu vực Khách chưa đăng nhập│ │ │ ├── layout.tsx # Bố cục Header và Footer cơ bản│ │ │ ├── page.tsx # Trang chủ hiển thị danh mục đấu giá nổi bật│ │ │ ├── login/page.tsx # Cửa sổ đăng nhập (Xử lý JWT)│ │ │ └── auctions/[id]/ # SSR: Chi tiết sản phẩm (chỉ xem, không thể bid)│ │ ├── (protected)/ # Nhóm yêu cầu xác thực bảo mật│ │ │ ├── layout.tsx # Bố cục chính chứa thanh điều hướng thông minh│ │ │ ├── (bidder)/ # Dành cho Người tham gia đấu giá│ │ │ │ ├── dashboard/page.tsx # Tổng quan: Các món hàng đang dẫn đầu, bị vượt mặt│ │ │ │ └── wallet/page.tsx # Quản lý số dư Escrow, nạp/rút tiền│ │ │ ├── (seller)/ # Dành cho Người bán│ │ │ │ ├── products/create/ # Màn hình cấu hình luật đấu giá và mức giá│ │ │ │ └── orders/page.tsx # Quản lý đơn hàng sau khi đấu giá thành công│ │ │ └── (admin)/ # Bảng điều khiển Quản trị viên│ │ │ ├── layout.tsx # Sidebar dành riêng cho Admin (Phân tích, Report)│ │ │ ├── users/page.tsx # Giao diện đóng băng tài khoản gian lận│ │ │ └── disputes/page.tsx # Nơi giải quyết tranh chấp đánh giá/giao nhận│ │ └── api/auth/[...nextauth]/ # Định tuyến NextAuth.js (Tùy chọn tích hợp OAuth)│ ├── components/ # Khu vực thành phần giao diện tái sử dụng│ │ ├── shared/ # Các UI cơ bản (Button, Modal, Input)│ │ └── real-time/ # Chứa: LiveBidHistory, CountdownTimer (Client components)│ ├── hooks/│ │ └── useAuctionSocket.ts # Custom Hook quản lý vòng đời WebSocket│ ├── store/│ │ └── useUserStore.ts # Quản lý trạng thái toàn cục bằng Zustand│ └── middleware.ts # Chốt chặn kiểm soát truy cập biên (Edge Runtime)### 5.2. Quản lý Quyền Truy cập tại Mức Biên (Middleware RBAC)

Hệ thống bảo vệ (Authorization) trong Next.js không dựa vào việc ẩn hiển thị nút bấm, mà được thực thi ngay tại tầng định tuyến máy chủ (Middleware). Tệp middleware.ts hoạt động trên Edge Runtime, chặn mọi luồng truy cập trước khi tài nguyên kịp phản hồi.
Cơ chế hoạt động dựa trên việc đọc chữ ký token từ Cookie. Nếu một tài khoản chỉ có quyền BIDDER cố gắng gõ URL /admin/users vào trình duyệt, hệ thống Middleware sẽ lập tức trích xuất thông tin role từ bộ nhớ cache hoặc JWT payload, phát hiện hành vi truy cập trái phép và thực hiện chuyển hướng (HTTP Redirect 302) người dùng về trang báo lỗi /unauthorized hoặc trang chủ. Việc thực thi phía máy chủ này loại bỏ hoàn toàn khả năng người dùng vượt mặt bằng cách giả mạo mã JavaScript ở phía trình duyệt khách (Client).

### 5.3. Xử lý Trạng thái Hiển thị Đấu giá Thời gian thực (Real-time Rendering)

Tại trang Chi tiết Phiên Đấu giá (auctions/[id]), kiến trúc kết hợp một cách khéo léo giữa SSR và CSR.

Phân phối Tĩnh (Server-Side): Khung trang, tiêu đề sản phẩm, hình ảnh và mô tả HTML được Server Component gọi API từ Fastify và kết xuất thành HTML tĩnh. Điều này giúp các cỗ máy tìm kiếm như Google bot lập chỉ mục nội dung trọn vẹn.

Đồng bộ Động (Client-Side): Một thành phần con có gắn cờ "use client" (Ví dụ: LiveBidPanel.tsx) được gắn vào trang. Thành phần này sử dụng Custom Hook useAuctionSocket để thiết lập kết nối WebSocket với máy chủ. Khi máy chủ đẩy (push) sự kiện BID_UPDATE kèm theo mức giá mới, React State sẽ được cập nhật, kích hoạt quá trình tái kết xuất (re-render) DOM nội hạt mà không ảnh hưởng đến phần tĩnh của trang.

Đồng hồ Đếm ngược Chính xác: Việc hiển thị thời gian kết thúc không phụ thuộc vào đồng hồ hệ thống trên máy tính của người dùng (vì chúng có thể bị sai lệch). Thay vào đó, thời gian effective_end_time từ máy chủ được sử dụng làm mốc. Bộ đếm ngược sử dụng thư viện xử lý thời gian, liên tục trừ khoảng thời gian hiện tại để tính ra thời gian còn lại. Khi cơ chế chống bắn tỉa (Anti-sniping) kéo dài thời gian trên máy chủ, một thông điệp WebSocket sẽ đẩy thời gian effective_end_time mới về Client, và đồng hồ đếm ngược sẽ tự động nhảy số hiển thị thời gian được gia hạn mà không gián đoạn luồng thị giác của người dùng.

## 6. Tổng kết Kiến trúc

Việc xây dựng một nền tảng đấu giá trực tuyến hoàn chỉnh đòi hỏi sự tinh giản nhưng cũng vô cùng nghiêm ngặt trong kỹ thuật phần mềm. Báo cáo này đã đưa ra bản thiết kế kiến trúc và triển khai vượt xa các hệ thống thương mại thông thường bằng cách giải quyết ba thách thức nền tảng: tốc độ phản hồi, bảo mật giao dịch và tính công bằng. Thông qua việc kết hợp NestJS (Fastify Adapter), kiến trúc module-domain và cấu trúc CSDL PostgreSQL chuẩn hóa, hệ thống đạt được hiệu năng định tuyến cao và kiểm soát chặt chẽ trạng thái tương tranh qua Khóa Lạc quan (Optimistic Locking). Sự an toàn tài chính được đảm bảo nhờ mô hình Ví Ký quỹ (Escrow) khóa tiền ngay khi lệnh giá thầu được sinh ra, tiêu diệt vấn nạn "bom hàng" của người chiến thắng. Tại tầng hiển thị, Next.js (App Router) với Middleware bảo vệ phân quyền (RBAC) cùng với kiến trúc WebSocket qua Redis Pub/Sub đem đến cho người dùng một trải nghiệm thời gian thực tuyệt hảo, loại trừ tác động tiêu cực của Sniping và tạo môi trường cạnh tranh lành mạnh thông qua Reputation System. Đây là blueprint hoàn chỉnh để triển khai dự án nghiên cứu khoa học với khả năng chịu tải cao và sẵn sàng thương mại hóa.
