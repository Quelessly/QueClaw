import crypto from 'crypto'
import { env } from '../config/env'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96-bit IV — recommended for GCM
const KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex') // 32 bytes, validated in env.ts

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * Output format: <iv hex>:<auth tag hex>:<ciphertext hex>
 * A fresh random IV is used per call, so identical plaintexts
 * produce different ciphertexts.
 */
export const encrypt = (plaintext: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypts a string produced by encrypt().
 * Throws a clean error on malformed input or tampered ciphertext
 * (GCM auth tag verification fails).
 */
export const decrypt = (ciphertext: string): string => {
  const parts = ciphertext.split(':')
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted value')
  }
  const [ivHex, tagHex, encryptedHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  if (iv.length !== IV_LENGTH || tag.length !== 16) {
    throw new Error('Malformed encrypted value')
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}