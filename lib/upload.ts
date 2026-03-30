async function uploadFile(file: File) {
  // 1. Request a presigned URL from your API
  const { presignedUrl, cdnUrl } = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  }).then((r) => r.json());

  // 2. Upload directly to S3 (bypasses your server)
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!uploadRes.ok) throw new Error("Upload failed");

  // 3. Save `cdnUrl` to your database — this is your permanent media URL
  return cdnUrl;
}
