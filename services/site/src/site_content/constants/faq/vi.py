# The FAQ in vi; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages. Questions not translated yet show in English
# (constants/faq/__init__.py).
FAQ = [
    {
        "key": "what",
        "question": "testee là gì?",
        "answer": "Một buổi phỏng vấn trắc nghiệm có tính giờ được tạo từ mô tả công việc của bạn, cho mọi vị trí. Dùng nó để sàng lọc ứng viên trước khi gặp họ, hoặc làm chính một bước tuyển dụng: dù cách nào, bạn cũng thấy ai thật sự thạo việc.",
    },
    {
        "key": "roles",
        "question": "Tôi có thể tuyển cho những vị trí nào?",
        "answer": "Mọi vị trí cần đến kiến thức: hỗ trợ khách hàng, bán hàng, tài chính, y tế, nghề kỹ thuật, kỹ sư, marketing và nhiều hơn nữa. Nếu bạn mô tả được công việc, testee có thể tạo buổi phỏng vấn cho nó.",
    },
    {
        "key": "hiring",
        "question": "Cách hoạt động thế nào?",
        "answer": "Dán mô tả công việc trên trang chủ, đặt tên công ty và kiểm tra các chủ đề testee đề xuất. Sau đó mời ứng viên: nhập email của họ, dán danh sách hoặc tải tệp lên. Ứng viên chưa bắt đầu sau vài ngày sẽ nhận một lời nhắc. Mỗi ứng viên có bộ câu hỏi riêng với thời gian giới hạn cho từng câu, và bạn thấy điểm cùng mọi câu trả lời của họ ngay khi họ làm xong.",
    },
    {
        "key": "templates",
        "question": "Tôi có thể bắt đầu từ một buổi phỏng vấn có sẵn không?",
        "answer": "Có. Tab Mẫu của công ty bạn liệt kê các buổi phỏng vấn có sẵn theo vị trí, bạn có thể tìm kiếm và lọc theo cấp độ và ngôn ngữ. Chủ sở hữu và quản trị viên có thể sao chép một mẫu vào công ty ngay lập tức, miễn phí, rồi thay đổi như mọi buổi phỏng vấn khác; ứng viên vẫn được tính phí như thường lệ.",
    },
    {
        "key": "link",
        "question": "Tôi có thể đặt buổi phỏng vấn vào tin tuyển dụng không?",
        "answer": "Có. Bật liên kết chia sẻ của buổi phỏng vấn trong thẻ Cài đặt và dán vào tin tuyển dụng. Ai mở liên kết sẽ đăng nhập và tham gia phỏng vấn, và mỗi người được tính phí như một ứng viên được mời. Khi hết credit, liên kết không nhận thêm người mới. Liên kết tự tắt khi bạn đánh dấu buổi phỏng vấn là đã tuyển.",
    },
    {
        "key": "preview",
        "question": "Tôi có thể thử buổi phỏng vấn trước khi mời ai không?",
        "answer": "Có. Mở buổi phỏng vấn của bạn với tư cách ứng viên từ trang của nó, miễn phí: các lần xem trước không xuất hiện trong danh sách ứng viên hay trong thống kê câu hỏi. Bạn cũng có thể làm bất kỳ buổi phỏng vấn luyện tập miễn phí nào.",
    },
    {
        "key": "question_quality",
        "question": "Các bạn kiểm tra câu hỏi đúng bằng cách nào?",
        "answer": "Trước khi một buổi phỏng vấn sẵn sàng, một AI thứ hai kiểm tra một mẫu đáp án của nó. Sau đó, các câu trả lời, lượt bình chọn và báo cáo sẽ đánh dấu những câu hỏi yếu; các câu này được sửa hoặc thay thế ở chế độ nền cho những ứng viên bắt đầu sau đó, còn điểm đã chấm không thay đổi. Trên trang của một chủ đề, bạn có thể đọc mọi câu hỏi, và chủ sở hữu cùng quản trị viên có thể tắt, tạo lại một câu hoặc đánh dấu đáp án của nó là sai.",
    },
    {
        "key": "open-to-offers",
        "question": "Các công ty có thể tìm thấy tôi qua phần luyện tập không?",
        "answer": "Chỉ khi bạn chọn như vậy. Bật Sẵn sàng nhận cơ hội việc làm sau một lượt luyện tập hoặc trong Cài đặt, kèm địa chỉ hồ sơ LinkedIn của bạn. Khi đó, các công ty đã nạp credit trên testee sẽ thấy tên, hồ sơ LinkedIn và kết quả luyện tập có tính giờ mới nhất của bạn ở từng chủ đề trong các buổi phỏng vấn của họ mà bạn đã luyện tập, và có thể mời bạn phỏng vấn. testee không xếp hạng hay giới thiệu bạn. Bạn có thể tắt bất cứ lúc nào trong Cài đặt, và bạn biến mất khỏi danh sách của mọi công ty ngay lập tức; tính năng này cũng tự kết thúc sau một năm kể từ lần cuối bạn bật nó hoặc lưu hồ sơ LinkedIn.",
    },
    {
        "key": "cheating",
        "question": "Ứng viên có thể dùng AI hoặc tra cứu đáp án không?",
        "answer": "Mỗi ứng viên nhận các câu hỏi được chọn ngẫu nhiên từ mọi chủ đề, theo thứ tự riêng, với [thời gian giới hạn cho từng câu](/guides/skills-test-timing-and-extra-time) do máy chủ của chúng tôi theo dõi, nên có rất ít thời gian để tra cứu đáp án hay hỏi AI. Bảng điểm cũng cho thấy khi ứng viên rời trang, sao chép văn bản hoặc trả lời quá nhanh để kịp đọc câu hỏi. Khi ứng viên làm xong, trang của họ còn chỉ ra những mẫu trả lời thường xuất hiện khi chuyển câu hỏi cho AI rồi chép lại đáp án, chẳng hạn mọi câu hỏi tốn gần như cùng một khoảng thời gian, hoặc câu khó thì đúng trong khi câu dễ lại sai, và gợi ý những câu ứng viên đã trả lời đúng để hỏi lại trong buổi phỏng vấn trực tiếp. Một mẫu trả lời là lý do để hỏi, không phải bằng chứng. Trước khi bắt đầu, mỗi ứng viên cũng xác nhận sẽ tự trả lời, không dùng công cụ AI hay nhờ người khác, và bảng điểm sẽ cho thấy điều đó.",
    },
    {
        "key": "practice",
        "question": "Tôi có thể luyện tập miễn phí không?",
        "answer": "Có. [Trang luyện tập](/practice) có các buổi phỏng vấn miễn phí theo vị trí: đăng nhập, chọn thời gian chuẩn, gấp đôi thời gian hoặc không giới hạn thời gian, và xem điểm cùng mọi đáp án đúng ở cuối. Phần luyện tập của bạn là riêng tư; công ty chỉ thấy kết quả nếu bạn bật Sẵn sàng nhận cơ hội việc làm.",
    },
    {
        "key": "voice",
        "question": "Ứng viên có thể trả lời bằng giọng nói không?",
        "answer": 'Có, nếu công ty đặt buổi phỏng vấn ở chế độ giọng nói, bằng bất kỳ ngôn ngữ nào trong 23 ngôn ngữ của testee; mức độ đọc và nghe tốt khác nhau tùy ngôn ngữ (hướng dẫn "Phỏng vấn bằng giọng nói trong 23 ngôn ngữ" cho thấy từng ngôn ngữ). Câu hỏi được đọc to và ứng viên trả lời thành tiếng; những gì họ nói được chuyển thành văn bản và khớp với một phương án. testee không lưu lại; OpenAI, bên thực hiện việc này cho chúng tôi, có thể lưu giữ tối đa 30 ngày, chỉ để kiểm tra lạm dụng trừ khi pháp luật yêu cầu lâu hơn. Giọng nói không bị phân tích về ngữ điệu hay cảm xúc, và ứng viên luôn có thể chạm để chọn thay vào đó.',
    },
    {
        "key": "extra_time",
        "question": "Ứng viên có thể được thêm thời gian không?",
        "answer": "Có. Trước khi ứng viên bắt đầu, chủ sở hữu và quản trị viên có thể cho họ thêm 25%, 50% hoặc 100% thời gian ở mỗi câu hỏi, trên trang của ứng viên; không cần ghi lý do. Người dùng liên kết chia sẻ cần xin công ty một lời mời cá nhân trước. Xem [cách tính thời gian cho bài kiểm tra kỹ năng](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Ứng viên có thể làm lại buổi phỏng vấn hoặc quay lại không?",
        "answer": "Không. Mỗi buổi phỏng vấn chỉ làm một lần, trong một lượt: ứng viên có thể đổi lựa chọn cho đến khi nhấn Câu tiếp theo, sau đó là chốt. Khi đã hoàn thành, họ không thể được mời lại vào buổi phỏng vấn đó.",
    },
    {
        "key": "connection",
        "question": "Nếu ứng viên mất kết nối hoặc đóng trang thì sao?",
        "answer": "Họ mở lại cùng liên kết và tiếp tục. Đồng hồ trên máy chủ của chúng tôi vẫn chạy trong lúc đó: câu hỏi hết giờ khi họ vắng mặt được tính là sai, và đồng hồ của câu tiếp theo bắt đầu khi câu đó hiện ra. Buổi phỏng vấn chưa hoàn thành tự kết thúc khi đã qua tổng thời gian của nó cộng thêm 10%.",
    },
    {
        "key": "cost",
        "question": "Chi phí bao nhiêu?",
        "answer": "Tạo buổi phỏng vấn là miễn phí. Mỗi ứng viên trả lời ít nhất một câu hỏi tốn {candidate} credit ({candidate_price}), và rẻ hơn với credit từ các lần nạp lớn hơn, xuống tới {cheapest_price}. Công ty đầu tiên của bạn nhận {company} credit miễn phí, đủ cho {company_candidates} ứng viên đầu tiên. Giá chưa bao gồm VAT hoặc thuế bán hàng. [Trang bảng giá](/pricing) liệt kê mọi mức giá.",
    },
    {
        "key": "charged",
        "question": "Khi nào tôi bị tính phí cho một ứng viên?",
        "answer": "Nếu ứng viên đã trả lời ít nhất một câu hỏi: khi buổi phỏng vấn của họ kết thúc (họ tự hoàn thành, hoặc hết giờ trong lúc họ vắng mặt), hoặc khi bạn thu hồi ứng viên, việc này cũng xóa vĩnh viễn câu trả lời của họ. Câu hỏi hết giờ mà chưa chọn câu trả lời thì không được tính. Tín dụng của họ được giữ lại khi bạn mời họ (qua liên kết thì khi họ bắt đầu), và được hoàn lại nếu bạn thu hồi họ trước khi họ trả lời bất cứ câu nào, nếu họ không bao giờ bắt đầu và lời mời hết hạn sau 30 ngày, hoặc nếu buổi phỏng vấn của họ kết thúc mà không có câu nào được trả lời.",
    },
    {
        "key": "compare_hiring",
        "question": "Giá so với các công cụ đánh giá khác thế nào?",
        "answer": "Nhiều công cụ đánh giá được bán theo gói đăng ký theo tháng hoặc năm, phải trả dù bạn không kiểm tra ai. Với testee, bạn chỉ trả theo ứng viên, bằng credit mua trước: {candidate} credit ({candidate_price}) mỗi ứng viên, không hợp đồng, không phí theo người dùng và không tốn phí tạo buổi phỏng vấn. Một công ty mời {example_candidates} ứng viên mỗi tháng trả khoảng {example_year_price} mỗi năm, chưa tính thuế. Nếu bạn kiểm tra nhiều ứng viên mỗi tháng, gói đăng ký có thể rẻ hơn, nên hãy so sánh với số liệu của bạn.",
    },
    {
        "key": "top_up",
        "question": "Làm sao để mua credit?",
        "answer": "Chủ sở hữu và quản trị viên nạp credit trên trang nạp credit, trong menu tài khoản, cho {min_candidates} đến {max_candidates} ứng viên mỗi lần. Paddle nhận thanh toán, cộng VAT hoặc thuế bán hàng nếu có và xuất biên lai hoặc hóa đơn; hóa đơn của mỗi lần nạp cũng có trong tab Thanh toán của công ty.",
    },
    {
        "key": "expire",
        "question": "Credit có hết hạn không?",
        "answer": "Không. Credit không bao giờ hết hạn, và không có gói đăng ký trả phí. Nếu bạn bật tự động nạp (không bắt buộc), Paddle lưu thẻ của bạn dưới dạng một gói đăng ký {zero_price}; bạn chỉ trả cho những lần nạp thực tế.",
    },
    {
        "key": "auto_top_up",
        "question": "Credit có thể tự động nạp không?",
        "answer": "Có, nếu chủ sở hữu hoặc quản trị viên bật trên trang nạp credit: chọn mức nạp và số dư cần nạp lại khi xuống dưới, rồi đánh dấu đồng ý với số tiền bị trừ và thời điểm trừ. Mỗi khi số dư khả dụng của công ty xuống dưới mức đó, thẻ đã lưu sẽ bị trừ tiền, cộng thuế nếu có, và chủ sở hữu cùng quản trị viên của công ty nhận được email. Lần trừ tiền bị từ chối sẽ được thử lại sau 1, 3 và 7 ngày; sau đó tự động nạp tạm dừng cho đến khi thẻ được cập nhật. Tắt tại nơi bạn đã bật sẽ dừng ngay lập tức.",
    },
    {
        "key": "currency",
        "question": "Tôi thanh toán bằng đồng tiền nào?",
        "answer": "Giá được tính bằng đồng tiền địa phương tại Canada, Úc, Israel, Ba Lan, Thụy Sĩ, Nhật Bản, Hàn Quốc, Đài Loan, Hồng Kông, Thái Lan, Singapore và Ấn Độ; bằng euro tại các nước còn lại của EU và tại Iceland, Liechtenstein và Na Uy; bằng bảng Anh tại Vương quốc Anh; và bằng đô la Mỹ ở những nơi khác. Tài khoản của bạn và mỗi công ty giữ đồng tiền của quốc gia nơi chúng được tạo hoặc được dùng lần đầu, dù bạn đi đâu: đổi đồng tiền của bạn trong Cài đặt, và của một công ty trên trang nạp credit (chủ sở hữu và quản trị viên). Các lần nạp của một công ty, kể cả tự động nạp, luôn được tính bằng đồng tiền của công ty. Nếu đổi tiền tệ khi tự động nạp đang bật, bạn sẽ thấy cả hai số tiền để xác nhận trước, và chủ sở hữu cùng quản trị viên của công ty sẽ nhận được email.",
    },
    {
        "key": "referrals",
        "question": "Tôi có thể nhận credit bằng cách giới thiệu một công ty không?",
        "answer": "Có. Chia sẻ liên kết trong tab Giới thiệu của công ty bạn: khi một công ty mới được tạo qua liên kết đó nạp credit lần đầu, với bất kỳ số tiền nào, cả hai công ty đều nhận {referral} credit, tối đa 25 lượt giới thiệu mỗi năm. Chỉ công ty đầu tiên theo email của chủ sở hữu mới được tính, và các công ty của chính bạn không được tính.",
    },
    {
        "key": "refunds",
        "question": "Tôi có được hoàn tiền không?",
        "answer": "Có, với credit bạn mua trong 14 ngày gần nhất và chưa dùng: trên trang thanh toán của công ty, qua Paddle hoặc bằng cách viết cho chúng tôi. Credit giữ chỗ cho ứng viên không được hoàn trong thời gian giữ chỗ; credit được giữ chỗ trong 14 ngày đó có thể được hoàn trong 7 ngày kể từ khi được trả lại. Credit miễn phí, như quà chào mừng, không được hoàn, và được tính là đã dùng trước. Chi tiết có trong [điều khoản](/terms).",
    },
    {
        "key": "scorecards",
        "question": "Bảng điểm cho thấy gì?",
        "answer": 'Mọi câu trả lời, đúng hay sai và mất bao lâu. Điểm là tỷ lệ phần trăm điểm đạt được: mỗi câu hỏi có một điểm, câu "chọn tất cả đáp án đúng" được một phần điểm cho mỗi đáp án đúng đã chọn, và không được điểm nào nếu chọn một đáp án sai. Điểm hiện màu xanh hoặc đỏ so với điểm đạt bạn đặt cho buổi phỏng vấn. Bảng điểm cũng đánh dấu các câu trả lời quá nhanh để kịp đọc câu hỏi, những lần ứng viên rời trang và các lần định sao chép.',
    },
    {
        "key": "reports",
        "question": "Tôi có thể chia sẻ kết quả với quản lý tuyển dụng không?",
        "answer": "Có. Tải xuống báo cáo PDF cho một ứng viên hoặc cho tất cả ứng viên của một buổi phỏng vấn, gửi qua email thẳng từ testee, hoặc gửi bản tóm tắt ngắn qua WhatsApp, Telegram, Viber hay LINE.",
    },
    {
        "key": "action_log",
        "question": "Tôi có thể xem ai đã làm gì trong công ty mình không?",
        "answer": "Có, nếu bạn là chủ sở hữu công ty. Tab Nhật ký thao tác của công ty liệt kê những việc các thành viên đã làm, mới nhất trước: mời hoặc xóa ứng viên, xem kết quả, thay đổi buổi phỏng vấn, nhóm, thanh toán và tích hợp, kèm theo ai đã làm, khi nào, và trợ lý, một ứng dụng AI, API hay một ATS có làm thay họ không. Bạn có thể lọc theo thành viên, loại thao tác và ngày, và tải xuống dưới dạng tệp CSV. Các thao tác được lưu trong 12 tháng. Thao tác của một khóa API hiện dưới tên của khóa.",
    },
    {
        "key": "bias_audit",
        "question": "Tôi có thể xuất kết quả cho kiểm toán thiên lệch không?",
        "answer": "Có, nếu bạn là chủ sở hữu công ty. Tab Nhật ký thao tác có Xuất dữ liệu kiểm toán thiên lệch: một tệp CSV gồm mọi ứng viên đã hoàn thành, cho tất cả buổi phỏng vấn hoặc một buổi và trong khoảng ngày đã chọn, kèm điểm của họ, điểm đạt, họ có đạt không và họ có trên trung vị của buổi phỏng vấn không. testee không lưu dữ liệu về giới tính, chủng tộc hay dân tộc, nên bạn tự thêm câu trả lời do ứng viên tự khai theo email, rồi xóa email trước khi đưa tệp cho đơn vị kiểm toán độc lập.",
    },
    {
        "key": "notes",
        "question": "Nhóm của tôi có thể ghi chú về một buổi phỏng vấn không?",
        "answer": "Có. Mỗi buổi phỏng vấn có tab Ghi chú, nơi nhóm của bạn viết ghi chú dạng văn bản thuần về đợt tuyển dụng, chẳng hạn ai cần liên hệ tiếp theo hoặc, với một công ty tuyển dụng, buổi phỏng vấn dành cho khách hàng nào. Mọi thành viên đều có thể viết ghi chú, kể cả người xem, và sửa ghi chú của mình; người viết, chủ sở hữu và quản trị viên có thể xóa ghi chú. Chủ sở hữu và quản trị viên có thể ghim một ghi chú, ghi chú đó sẽ hiện dưới tên buổi phỏng vấn. Ứng viên không bao giờ thấy ghi chú.",
    },
    {
        "key": "team",
        "question": "Tôi có thể thêm nhóm của mình không?",
        "answer": "Có, và thành viên không mất phí. Trong tab Nhóm của công ty, chủ sở hữu mời từng người qua email với vai trò quản trị viên hoặc người xem. Quản trị viên làm được mọi việc trừ quản lý nhóm, xem nhật ký thao tác và xóa công ty. Người xem thấy buổi phỏng vấn và kết quả, chia sẻ báo cáo và viết ghi chú, nhưng không thay đổi gì khác và không thể nạp credit. Một tài khoản có thể sở hữu nhiều công ty, mỗi công ty có nhóm và credit riêng.",
    },
    {
        "key": "integrations",
        "question": "testee có hoạt động với ATS hoặc các công cụ khác của tôi không?",
        "answer": "Có, không mất thêm phí; ứng viên vẫn được tính phí như thường lệ. Chủ sở hữu và quản trị viên kết nối Workable, Greenhouse, Teamtailor, Recruitee hoặc Breezy HR trong tab Tích hợp của công ty bằng một khóa từ ATS, rồi liên kết một vị trí với một buổi phỏng vấn và một giai đoạn: ứng viên bạn chuyển sang giai đoạn đó sẽ nhận buổi phỏng vấn, và kết quả được gửi lại ATS ([cách kết nối bài kiểm tra kỹ năng với ATS](/guides/ats-integration-skills-tests)). Slack có thể đăng thông báo của công ty vào một kênh, còn API cho phép nền tảng của riêng bạn tạo buổi phỏng vấn, mời và quản lý ứng viên, và nhận kết quả của họ, mỗi khóa API chỉ làm được những gì bạn đánh dấu cho nó; xem [Tài liệu API](/api-docs).",
    },
    {
        "key": "slack",
        "question": "Tích hợp Slack hoạt động thế nào?",
        "answer": 'Chủ sở hữu hoặc quản trị viên chọn "Thêm vào Slack" trong tab Tích hợp của công ty và chọn một kênh, rồi chọn những thông báo sẽ gửi đến đó, như ứng viên đã hoàn thành, lời mời không gửi được, ứng viên ATS chưa được mời hoặc ghi chú mới. Miễn phí.',
    },
    {
        "key": "api_keys",
        "question": "Khóa API hoạt động thế nào?",
        "answer": "Chủ sở hữu và quản trị viên tạo khóa trên trang API của công ty, trong Tích hợp. Bạn đánh dấu những gì mỗi khóa được làm, chọn thời điểm hết hạn (sau 1, 3, 6 hoặc 12 tháng, hoặc không bao giờ) và có thể giới hạn theo các địa chỉ IP được phép. Khóa chỉ hiển thị một lần. Một công ty có thể gửi 60 yêu cầu mỗi phút. [Tài liệu cho nhà phát triển](/api-docs) mô tả mọi lệnh gọi.",
    },
    {
        "key": "webhooks",
        "question": "testee có thể báo cho hệ thống của tôi khi ứng viên hoàn thành không?",
        "answer": "Có, bằng webhook, thiết lập trên trang API của công ty. testee gọi đến địa chỉ của bạn khi ứng viên bắt đầu, hoàn thành (kèm kết quả), không liên hệ được, hết hạn hoặc bị xóa, và khi một buổi phỏng vấn sẵn sàng, đồng thời ký mỗi lệnh gọi bằng khóa bí mật của bạn. Lệnh gọi thất bại được thử lại trong 3 ngày; sau đó webhook tạm dừng cho đến khi một sự kiện thử thành công. Mỗi webhook có nhật ký các lần gửi gần nhất. Xem [tài liệu webhook](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "Ứng viên có thể phỏng vấn ngay trên trang web của tôi không?",
        "answer": "Có, bằng SDK của testee: một đoạn mã hiển thị buổi phỏng vấn ngay trong trang của bạn, trên các trang web bạn cho phép ở trang API của công ty. Máy chủ của bạn mời từng ứng viên qua API với đăng nhập được tắt, nên họ không cần tài khoản testee và testee không gửi email cho họ. Không tốn thêm phí; ứng viên vẫn được tính phí như thường lệ. Xem [tài liệu SDK](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Tôi có thể dùng testee từ Claude, ChatGPT hoặc agent AI của riêng tôi không?",
        "answer": "Có. Thêm testee vào Claude hoặc ChatGPT dưới dạng trình kết nối (các bước có trong tab Tích hợp của công ty bạn) rồi cho phép trên testee, chỉ đọc hoặc được thay đổi luôn. Sau đó, ứng dụng sẽ thay mặt bạn, với quyền của bạn, làm việc với các công ty, buổi phỏng vấn và kết quả của ứng viên. Tài khoản hoặc công ty chỉ có thể xóa trong testee. Dữ liệu ứng dụng đọc được sẽ đến nhà cung cấp của ứng dụng đó theo điều khoản của ứng dụng. Bạn có thể ngắt kết nối bất cứ lúc nào trong cùng tab, và chủ sở hữu cùng quản trị viên có thể tắt các ứng dụng AI cho một công ty. Các ứng dụng AI khác và agent do bạn tự xây dựng cũng kết nối được: [tab MCP](/api-docs?tab=mcp) trong tài liệu cho nhà phát triển có các bước và agent mẫu, và agent chạy trên máy chủ có thể đăng nhập bằng khóa API có quyền dành cho agent AI, và chỉ làm được những gì các quyền khác của khóa cho phép. [Hướng dẫn về agent AI, MCP và API](/guides/ai-agents-mcp-and-api) giải thích mỗi thứ dùng để làm gì.",
    },
    {
        "key": "candidates",
        "question": "Ứng viên thấy gì?",
        "answer": "Tên và logo công ty của bạn, với màu sắc và phông chữ của công ty bạn (đặt trong thẻ Thương hiệu), những gì cần biết trước khi bắt đầu, rồi lần lượt từng câu hỏi có giới hạn thời gian. Buổi phỏng vấn không bao giờ cho họ thấy điểm của mình hay câu trả lời có đúng không; chỉ bản tải dữ liệu của chính họ mới có điểm của họ.",
    },
    {
        "key": "brand",
        "question": "Buổi phỏng vấn có thể mang thương hiệu công ty tôi không?",
        "answer": "Có, không mất thêm phí. Trong tab Thương hiệu của công ty, chủ sở hữu và quản trị viên đặt logo, màu cho giao diện sáng và tối, phông chữ và độ bo góc. Ứng viên thấy những thứ này trong suốt buổi phỏng vấn, không có đầu trang hay chân trang của testee, và logo cũng hiện trong email và báo cáo.",
    },
    {
        "key": "candidate_account",
        "question": "Ứng viên có cần tài khoản không?",
        "answer": "Có, và miễn phí: họ đăng nhập bằng Google, LinkedIn hoặc GitHub, với email đã xác minh mà bạn mời, nên lời mời bị chuyển tiếp không có ích cho ai khác. Qua liên kết chia sẻ, email đã xác minh nào cũng được. Ngoại lệ là lời mời do chính nền tảng của bạn tạo qua API, có thể bỏ qua bước đăng nhập.",
    },
    {
        "key": "verified",
        "question": "Dấu xác minh có nghĩa là gì?",
        "answer": "Nghĩa là chủ sở hữu hoặc quản trị viên của công ty đã đăng nhập bằng email công việc trên website của công ty, như you@acme.com, và sau đó đội ngũ của chúng tôi đã xem xét công ty. Thêm website bằng nút Xác minh ở phần đầu trang công ty; dịch vụ email miễn phí không được tính. Trong khi chờ xem xét, nhóm của bạn thấy biểu tượng đồng hồ cạnh tên, và đổi tên công ty sẽ gửi công ty đi xem xét lại. Dấu xác minh hiện cạnh tên công ty của bạn, kể cả trong lời mời.",
    },
    {
        "key": "languages",
        "question": "Hỗ trợ những ngôn ngữ nào?",
        "answer": "{count} ngôn ngữ, cho trang web, các buổi phỏng vấn và email. Hãy chọn ngôn ngữ viết buổi phỏng vấn, bất kể mô tả công việc được viết bằng ngôn ngữ nào.",
    },
    {
        "key": "mira",
        "question": "Mira là ai?",
        "answer": 'Trợ lý AI của testee: một AI, không phải con người, và câu trả lời có thể sai. Mở bằng "hỏi Mira" ở đầu trang. Khách truy cập có thể hỏi mọi điều về testee. Khi đã đăng nhập, Mira còn đọc các công ty của bạn theo quyền truy cập của bạn và thực hiện những thay đổi bạn yêu cầu, mỗi thay đổi chỉ sau khi bạn xác nhận. Hỏi Mira không tốn credit, và ứng viên không dùng được Mira trong lúc phỏng vấn.',
    },
    {
        "key": "search",
        "question": "Tôi có thể tìm kiếm trên testee không?",
        "answer": "Có. Ô tìm kiếm ở đầu trang tìm ngay khi bạn gõ các công ty, buổi phỏng vấn và ứng viên của bạn (theo tên hoặc email), cùng các trang, hướng dẫn, so sánh, văn bản pháp lý, câu hỏi FAQ và bài kiểm tra kỹ năng của trang web. Khi chưa đăng nhập, nó chỉ tìm những gì công khai.",
    },
    {
        "key": "privacy",
        "question": "Mô tả công việc và câu trả lời được xử lý thế nào?",
        "answer": "Mô tả công việc được dùng để tạo các buổi phỏng vấn của công ty bạn, và câu trả lời của ứng viên để chấm điểm cho công ty bạn. Các câu hỏi testee tạo cũng có thể được tái sử dụng trong các buổi phỏng vấn và luyện tập của công ty khác, mà không kèm bất cứ thông tin nào nhận dạng bạn, công ty của bạn hay bất kỳ ai khác; bạn có thể loại các câu hỏi của một buổi phỏng vấn khỏi việc này trong phần cài đặt của buổi phỏng vấn đó. testee cũng học các mẫu chung, đã ẩn danh hóa, về chất lượng câu hỏi từ cách các câu hỏi được trả lời, để cải thiện cách tạo câu hỏi. [Chính sách quyền riêng tư](/privacy) giải thích chúng tôi lưu gì, trong bao lâu, và quyền của mọi người.",
    },
    {
        "key": "question_bank",
        "question": "Câu hỏi trong buổi phỏng vấn của tôi có được chia sẻ với công ty khác không?",
        "answer": "Mặc định là có. Câu hỏi do testee tạo có thể vào ngân hàng câu hỏi dùng chung sau khi đã được trả lời vài lần và vượt qua các kiểm tra rằng nó không nêu tổ chức, người hay thông tin liên hệ nào; bản sao không chứa gì nhận dạng công ty của bạn. Chủ sở hữu và quản trị viên có thể loại câu hỏi của một buổi phỏng vấn trong thẻ Cài đặt của buổi đó; không có cài đặt cho toàn công ty. Những câu hỏi đã được tái sử dụng vẫn còn, kể cả khi công ty của bạn bị xóa.",
    },
    {
        "key": "ai_training",
        "question": "Dữ liệu của chúng tôi có được dùng để huấn luyện mô hình AI không?",
        "answer": "OpenAI, bên cung cấp AI cho testee, không huấn luyện mô hình bằng những gì chúng tôi gửi, theo điều khoản API của họ; họ có thể lưu giữ tối đa 30 ngày, chỉ để kiểm tra lạm dụng trừ khi pháp luật yêu cầu lâu hơn. Bản thân testee học các mẫu chung, đã ẩn danh hóa, về chất lượng câu hỏi để cải thiện cách tạo câu hỏi.",
    },
    {
        "key": "data_storage",
        "question": "Dữ liệu của chúng tôi được lưu ở đâu?",
        "answer": "Trên Google Cloud, tại Bỉ. Một số nhà cung cấp xử lý dữ liệu tại Hoa Kỳ, như OpenAI và Resend, theo Khung bảo mật dữ liệu EU-Hoa Kỳ hoặc các điều khoản hợp đồng tiêu chuẩn của Ủy ban châu Âu. [Trang tin cậy](/trust) liệt kê tất cả.",
    },
    {
        "key": "eu_ai_law",
        "question": "Dùng AI để sàng lọc ứng viên ở EU có hợp pháp không?",
        "answer": "Có, nhưng phải theo quy định. Theo Đạo luật AI của EU (EU AI Act), các công cụ chấm điểm ứng viên rất có thể thuộc nhóm rủi ro cao, với các nghĩa vụ áp dụng từ ngày 2/12/2027, và GDPR thì đã áp dụng: con người đưa ra quyết định tuyển dụng, ứng viên được thông báo rằng AI được sử dụng, và hồ sơ được lưu giữ. testee hoạt động đúng như vậy: AI soạn câu hỏi, người trong công ty bạn xem xét kết quả và quyết định, và ứng viên được thông báo trước khi bắt đầu. Đây không phải là tư vấn pháp lý; [Dùng AI trong tuyển dụng có hợp pháp ở EU không?](/guides/is-ai-hiring-legal-in-the-eu) giải thích các quy định và mốc thời gian.",
    },
    {
        "key": "uk_us",
        "question": "Chúng tôi có thể dùng testee cho ứng viên ở Vương quốc Anh và Hoa Kỳ không?",
        "answer": "Có. Thỏa thuận xử lý dữ liệu bao quát luật của Vương quốc Anh và Hoa Kỳ, còn hướng dẫn cho các công ty và các mẫu thông báo cho ứng viên (có phiên bản cho Thành phố New York, Illinois, Colorado và Connecticut) bao quát những gì bạn phải cho ứng viên biết. Với các công việc tại Thành phố New York, chỉ dùng testee sau khi bạn đã làm những gì Local Law 144 yêu cầu: một cuộc kiểm toán thiên lệch độc lập trong vòng một năm trước khi sử dụng, công bố bản tóm tắt của cuộc kiểm toán đó và thông báo cho ứng viên trước 10 ngày làm việc. Bản xuất cho kiểm toán thiên lệch trong Nhật ký thao tác cung cấp cho kiểm toán viên của bạn điểm và kết quả của từng ứng viên đã hoàn thành, để đối chiếu với câu trả lời do chính ứng viên tự khai.",
    },
    {
        "key": "emails",
        "question": "testee gửi những email nào, và làm sao để dừng nhận?",
        "answer": 'Email dịch vụ, như lời mời, báo cáo, email thanh toán và thay đổi điều khoản của chúng tôi, không thể tắt; chỉ địa chỉ bị trả lại vĩnh viễn hoặc đã đánh dấu một email của chúng tôi là thư rác mới ngừng nhận chúng. Những email còn lại, như tóm tắt hoạt động hằng ngày, lời nhắc, cập nhật sản phẩm và ưu đãi, bạn chọn trong Cài đặt, mục Email, hoặc dừng bằng liên kết "Hủy đăng ký" trong mỗi email. Ứng viên có thể dừng nhận email từ công ty bạn, hoặc lời nhắc của một buổi phỏng vấn, bằng các liên kết trong lời mời và lời nhắc của họ. Tin tức của testee hiển thị trong thông báo của bạn, biểu tượng chuông ở trên cùng; tin quan trọng cũng được gửi qua email dưới dạng cập nhật sản phẩm, chỉ khi cài đặt đó đang bật.',
    },
    {
        "key": "data_export",
        "question": "Tôi có thể tải dữ liệu của mình không?",
        "answer": 'Có. "Tải dữ liệu của tôi" trong Cài đặt cung cấp một tệp JSON gồm những gì testee lưu về bạn; với các buổi phỏng vấn của công ty, tệp có câu trả lời và điểm của bạn, nhưng không có câu nào là đúng. Không có tính năng xuất toàn bộ công ty: chủ sở hữu có thể tải nhật ký thao tác, và thành viên có thể tải báo cáo PDF của ứng viên.',
    },
    {
        "key": "candidate_data",
        "question": "Ứng viên có thể yêu cầu xóa dữ liệu của mình bằng cách nào?",
        "answer": "Bằng cách yêu cầu công ty đã mời họ: thu hồi một ứng viên đã bắt đầu sẽ xóa vĩnh viễn họ và kết quả của họ. Hoặc bằng cách xóa tài khoản testee trong Cài đặt, việc này xóa kết quả của họ. Nếu không, kết quả sẽ tự động bị xóa sau 12 tháng kể từ lần gửi lời mời cuối cùng.",
    },
    {
        "key": "delete",
        "question": "Tôi có thể xóa tài khoản không?",
        "answer": "Có, trong Cài đặt, trừ khi bạn là chủ sở hữu của một công ty có người khác đã tham gia: trước tiên hãy đặt một thành viên khác làm chủ sở hữu, hoặc xóa công ty đó. Tài khoản và dữ liệu của bạn bị xóa, cùng các công ty chỉ có mình bạn là thành viên và credit của các công ty đó, vì vậy hãy yêu cầu trước khoản hoàn tiền bạn được hưởng. Công ty giữ lại bản ghi lời mời của bạn nhưng không có email của bạn, và hồ sơ mua hàng được lưu theo yêu cầu của luật kế toán. Trước đó bạn có thể tải xuống bản sao dữ liệu.",
    },
    {
        "key": "company_delete",
        "question": "Tôi có thể xóa một công ty không?",
        "answer": "Có, nếu bạn là chủ sở hữu. Các buổi phỏng vấn, ứng viên, kết quả và credit của công ty bị xóa vĩnh viễn và tự động nạp của công ty dừng lại, vì vậy hãy yêu cầu trước khoản hoàn tiền bạn được hưởng. Các bản sao câu hỏi của công ty đã có trong ngân hàng câu hỏi dùng chung vẫn được giữ lại.",
    },
    {
        "key": "report",
        "question": "Làm sao để báo cáo sự cố?",
        "answer": "Hãy viết cho chúng tôi qua [trang liên hệ](/contact) và dán ID của đối tượng liên quan: “sao chép id” nằm dưới tên của công ty, buổi phỏng vấn hoặc ứng viên, còn ID tài khoản của bạn nằm trong menu tài khoản và trong Cài đặt. Có ID, chúng tôi tìm thấy ngay.",
    },
]
