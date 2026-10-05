package com.app.backend.common.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_NOT_FOUND(1001, "Người dùng không tồn tại trong hệ thống", HttpStatus.NOT_FOUND),
    INVALID_CREDENTIALS(1002, "Tên đăng nhập hoặc mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1003, "Phiên đăng nhập đã hết hạn hoặc không hợp lệ", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1004, "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    ACCOUNT_LOCKED(1005, "Tài khoản người dùng đã bị khóa hoặc ngừng hoạt động", HttpStatus.FORBIDDEN),
    USER_EXISTED(1006, "Tên đăng nhập đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    
    COMPANY_NOT_FOUND(2001, "Không tìm thấy thông tin doanh nghiệp", HttpStatus.NOT_FOUND),
    TAX_CODE_EXISTED(2002, "Mã số thuế doanh nghiệp đã tồn tại", HttpStatus.CONFLICT),
    
    BRANCH_NOT_FOUND(3001, "Không tìm thấy thông tin chi nhánh", HttpStatus.NOT_FOUND),
    
    GOLD_PRICE_NOT_FOUND(4001, "Chưa thiết lập bảng giá cho loại vàng này", HttpStatus.NOT_FOUND),
    INVALID_GOLD_PRICE(4002, "Giá bán ra không được nhỏ hơn giá mua vào", HttpStatus.BAD_REQUEST),
    
    PRODUCT_NOT_FOUND(5001, "Không tìm thấy sản phẩm hoặc mã tem không đúng", HttpStatus.NOT_FOUND),
    TAG_CODE_EXISTED(5002, "Mã tem sản phẩm đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    INVALID_GOLD_WEIGHT(5003, "Trọng lượng đá không được vượt quá tổng trọng lượng sản phẩm", HttpStatus.BAD_REQUEST),
    
    INSUFFICIENT_STOCK(6001, "Số lượng hàng trong kho không đủ để thực hiện giao dịch", HttpStatus.BAD_REQUEST),
    
    INSUFFICIENT_CASH_BALANCE(7001, "Số dư quỹ tiền mặt không đủ để thực hiện phiếu chi", HttpStatus.BAD_REQUEST),
    SHIFT_ALREADY_OPEN(7002, "Ca làm việc đang mở, không thể mở thêm ca mới", HttpStatus.BAD_REQUEST),
    SHIFT_NOT_OPEN(7003, "Chưa mở ca làm việc để thực hiện giao dịch sổ quỹ", HttpStatus.BAD_REQUEST),
    
    INVALID_REQUEST(8001, "Dữ liệu yêu cầu không hợp lệ hoặc thiếu thông tin bắt buộc", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
