#!/usr/bin/env bash
# Convert iPhone HEIC and other image files to optimized WebP for the site.
#
# Requires:
#   - macOS `sips` (built in) for HEIC/resize
#   - `cwebp` from the WebP tools: brew install webp
#
# Examples:
#   ./scripts/images-to-webp.sh -o export/web ~/Downloads/beetle/*.HEIC
#   ./scripts/images-to-webp.sh -r -o public/images/cars/1970-vw-beetle ./incoming/
#   ./scripts/images-to-webp.sh -z 1600 -q 85 photo.jpg

set -euo pipefail

readonly SUPPORTED_EXTENSIONS="heic HEIC heif HEIF jpg jpeg JPG JPEG png PNG tif tiff TIF TIFF"

MAX_DIMENSION=2048
QUALITY=88
OUTPUT_DIR=""
RECURSIVE=false
INPUT_PATHS=()

usage() {
  cat <<'EOF'
Convert images (including iPhone HEIC) to resized WebP files.

Usage:
  images-to-webp.sh [options] <path>...

Options:
  -o, --output DIR       Output directory (created if needed). Default: same as each input file.
  -z, --max-dimension N  Max width or height in pixels (default: 2048).
  -q, --quality N        WebP quality 0-100 (default: 88).
  -r, --recursive        Recursively process image files under directories.
  -h, --help             Show this help.

Dependencies:
  brew install webp    # provides cwebp

EOF
}

log() {
  printf '%s\n' "$*" >&2
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Error: '$1' is required but not found."
    if [[ "$1" == "cwebp" ]]; then
      log "Install WebP tools with: brew install webp"
    fi
    exit 1
  fi
}

is_supported_image() {
  local file="$1"
  local ext="${file##*.}"
  case " ${SUPPORTED_EXTENSIONS} " in
    *" ${ext} "*) return 0 ;;
    *) return 1 ;;
  esac
}

ensure_output_dir() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    mkdir -p "$dir"
  fi
}

resize_to_temp() {
  local src="$1"
  local temp_file="$2"
  sips -Z "$MAX_DIMENSION" -s format jpeg -s formatOptions 95 "$src" --out "$temp_file" >/dev/null
}

convert_to_webp() {
  local src="$1"
  local dest="$2"
  local temp_file

  ensure_output_dir "$(dirname "$dest")"

  temp_file="$(mktemp "${TMPDIR:-/tmp}/images-to-webp.XXXXXX.jpg")"
  resize_to_temp "$src" "$temp_file"
  cwebp -quiet -q "$QUALITY" "$temp_file" -o "$dest"
  rm -f "$temp_file"

  log "Wrote ${dest}"
}

output_path_for() {
  local src="$1"
  local base
  base="$(basename "${src%.*}")"

  if [[ -n "$OUTPUT_DIR" ]]; then
    printf '%s/%s.webp' "$OUTPUT_DIR" "$base"
    return
  fi

  printf '%s/%s.webp' "$(dirname "$src")" "$base"
}

process_file() {
  local src="$1"

  if [[ ! -f "$src" ]]; then
    log "Skipping missing file: ${src}"
    return
  fi

  if ! is_supported_image "$src"; then
    log "Skipping unsupported file: ${src}"
    return
  fi

  convert_to_webp "$src" "$(output_path_for "$src")"
}

collect_files() {
  local path="$1"

  if [[ -f "$path" ]]; then
    process_file "$path"
    return
  fi

  if [[ ! -d "$path" ]]; then
    log "Skipping missing path: ${path}"
    return
  fi

  if [[ "$RECURSIVE" == true ]]; then
    while IFS= read -r -d '' file; do
      process_file "$file"
    done < <(find "$path" -type f \( \
      -iname '*.heic' -o -iname '*.heif' -o -iname '*.jpg' -o -iname '*.jpeg' -o \
      -iname '*.png' -o -iname '*.tif' -o -iname '*.tiff' \) -print0)
  else
    local file
    for file in "$path"/*; do
      [[ -f "$file" ]] || continue
      process_file "$file"
    done
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -o | --output)
        OUTPUT_DIR="${2:-}"
        shift 2
        ;;
      -z | --max-dimension)
        MAX_DIMENSION="${2:-}"
        shift 2
        ;;
      -q | --quality)
        QUALITY="${2:-}"
        shift 2
        ;;
      -r | --recursive)
        RECURSIVE=true
        shift
        ;;
      -h | --help)
        usage
        exit 0
        ;;
      --)
        shift
        INPUT_PATHS+=("$@")
        break
        ;;
      -*)
        log "Unknown option: $1"
        usage
        exit 1
        ;;
      *)
        INPUT_PATHS+=("$1")
        shift
        ;;
    esac
  done
}

main() {
  parse_args "$@"

  if [[ ${#INPUT_PATHS[@]} -eq 0 ]]; then
    usage
    exit 1
  fi

  if [[ -n "$OUTPUT_DIR" ]]; then
    ensure_output_dir "$OUTPUT_DIR"
  fi

  require_command sips
  require_command cwebp

  local path
  for path in "${INPUT_PATHS[@]}"; do
    collect_files "$path"
  done
}

main "$@"
