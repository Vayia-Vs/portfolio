export function getImageName(imageRef: string) {
  if (/^https?:\/\//i.test(imageRef)) {
    try {
      const url = new URL(imageRef);
      return url.pathname.split("/").pop() ?? imageRef;
    } catch {
      return imageRef.split("/").pop() ?? imageRef;
    }
  }

  return imageRef.split("/").pop() ?? imageRef;
}

export function toImageSrc(imageRef: string) {
  if (/^https?:\/\//i.test(imageRef)) {
    return imageRef;
  }

  return `/images/${encodeURIComponent(imageRef)}`;
}
