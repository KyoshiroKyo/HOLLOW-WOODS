import os
import sys
import zipfile

ROOT_DIR = os.path.abspath(os.getcwd())
DIST_DIR = os.path.join(ROOT_DIR, "dist")
ZIP_FILE = os.path.join(ROOT_DIR, "HOLLOW_WOODS_v1.4.zip")

print("=" * 64)
print("🚀 ĐÓNG GÓI CHUẨN POSIX/LINUX CHO NỀN TẢNG P2GAME.IO")
print("=" * 64)

if not os.path.exists(DIST_DIR):
    print(f"❌ Thư mục {DIST_DIR} không tồn tại!")
    sys.exit(1)

# Xóa file zip cũ nếu có
if os.path.exists(ZIP_FILE):
    os.remove(ZIP_FILE)

entries_count = 0
total_uncompressed_bytes = 0

with zipfile.ZipFile(ZIP_FILE, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
    for root, dirs, files in os.walk(DIST_DIR):
        # Sắp xếp để file nén có thứ tự nhất quán
        dirs.sort()
        files.sort()
        for file in files:
            full_path = os.path.join(root, file)
            # Đường dẫn tương đối bên trong dist, chuyển đổi bắt buộc thành '/'
            arcname = os.path.relpath(full_path, DIST_DIR).replace("\\", "/")
            
            # Kiểm tra an toàn tuyệt đối
            if any(forbidden in arcname for forbidden in ["node_modules", ".git", ".map", "src/", "docs/", "backup"]):
                print(f"⚠️ Phát hiện file rác bị bỏ qua: {arcname}")
                continue
                
            file_size = os.path.getsize(full_path)
            total_uncompressed_bytes += file_size
            zipf.write(full_path, arcname)
            entries_count += 1

zip_size = os.path.getsize(ZIP_FILE)
ratio = (1.0 - (zip_size / total_uncompressed_bytes)) * 100 if total_uncompressed_bytes > 0 else 0

print(f"📁 Tệp xuất ra: {ZIP_FILE}")
print(f"📦 Số lượng tệp đã nén: {entries_count}")
print(f"⚖️ Dung lượng gốc (Uncompressed): {total_uncompressed_bytes / (1024 * 1024):.2f} MB ({total_uncompressed_bytes:,} bytes)")
print(f"📦 Dung lượng tệp ZIP (Compressed): {zip_size / (1024 * 1024):.2f} MB ({zip_size:,} bytes)")
print(f"📉 Tỉ lệ nén: {ratio:.1f}%")

# Xác thực trực tiếp nội dung gói zip
with zipfile.ZipFile(ZIP_FILE, 'r') as verify_zip:
    namelist = verify_zip.namelist()
    root_items = set()
    for name in namelist:
        parts = name.split('/')
        if len(parts) == 1:
            root_items.add(parts[0])
        else:
            root_items.add(parts[0] + '/')

    print("\n📂 CÁC MỤC Ở LỚP GỐC (ROOT LEVEL) TRONG FILE NÉN:")
    for item in sorted(root_items):
        print(f"   ├── {item}")

    has_index = "index.html" in root_items
    has_p2game = "p2game.json" in root_items
    has_dist_wrapper = any(n.startswith("dist/") for n in namelist)
    has_backslashes = any("\\" in n for n in namelist)

    print("\n🔍 ĐỐI CHIẾU TIÊU CHUẨN NỀN TẢNG:")
    print(f"   {'✅' if has_index else '❌'} index.html ở lớp ngoài cùng: {has_index}")
    print(f"   {'✅' if has_p2game else '❌'} p2game.json ở lớp ngoài cùng: {has_p2game}")
    print(f"   {'✅' if not has_dist_wrapper else '❌'} Không bọc thư mục dist/: {not has_dist_wrapper}")
    print(f"   {'✅' if not has_backslashes else '❌'} Chuẩn POSIX phân cách thư mục ('/'): {not has_backslashes}")

print("=" * 64)
