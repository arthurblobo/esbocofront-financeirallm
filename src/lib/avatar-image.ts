const maxPhotoBytes = 5_000_000
const avatarSize = 128

type PhotoResult =
  | { ok: true; photo: string }
  | { ok: false; reason: 'photoType' | 'photoSize' | 'photoRead' }

export async function resizeAvatar(file: File): Promise<PhotoResult> {
  if (file.size > maxPhotoBytes) return { ok: false, reason: 'photoSize' }

  try {
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    const isJpeg = /\.jpe?g$/i.test(file.name) && header[0] === 255 && header[1] === 216 && header[2] === 255
    const isPng = /\.png$/i.test(file.name) &&
      [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => header[index] === byte)
    const isWebp = /\.webp$/i.test(file.name) &&
      String.fromCharCode(...header.slice(0, 4)) === 'RIFF' && String.fromCharCode(...header.slice(8, 12)) === 'WEBP'
    if (!isJpeg && !isPng && !isWebp) return { ok: false, reason: 'photoType' }

    const image = await createImageBitmap(file)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = avatarSize
      canvas.height = avatarSize
      const context = canvas.getContext('2d')
      if (!context) return { ok: false, reason: 'photoRead' }

      const cropSize = Math.min(image.width, image.height)
      context.drawImage(
        image, (image.width - cropSize) / 2, (image.height - cropSize) / 2, cropSize, cropSize, 0, 0, avatarSize, avatarSize,
      )
      return { ok: true, photo: canvas.toDataURL('image/webp', 0.85) }
    } finally {
      image.close()
    }
  } catch {
    return { ok: false, reason: 'photoRead' }
  }
}
