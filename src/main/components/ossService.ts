import OSS from 'ali-oss'

export const registerOssService = async (params) => {
  const { config, fileInfo } = params
  const { pathPrefix, ...ossClientConfig } = config
  try {
    const client = new OSS({
      ...ossClientConfig,
      timeout: 60000, // 设置超时时间为 60 秒
      secure: true, // 强制使用 HTTPS
      retryMax: 3 // 设置最大重试次数为 3 次
    })
    // 拼接存储目录前缀，将图片保存到指定目录下
    const objectKey = pathPrefix
      ? `${pathPrefix.replace(/\/$/, '')}/${fileInfo.name}`
      : `pc/mall/${fileInfo.name}`
    // 使用 buffer 上传，避免文件路径问题
    const result = await client.put(objectKey, Buffer.from(fileInfo.buffer))
    return { success: true, url: result.url }
  } catch (error) {
    console.error('OSS Upload Error:', error)
    return { success: false, error: (error as Error).message }
  }
}
