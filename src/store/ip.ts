import { ref } from 'vue'

const minioIp = ref('10.14.187.132')

export function useIp() {
  function setIp(ip: string) {
    minioIp.value = ip
  }

  return {
    minioIp,
    setIp,
  }
}
