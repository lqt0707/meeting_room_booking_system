import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

/**
 * Redis 服务类，提供与 Redis 数据库交互的常用方法
 */
@Injectable()
export class RedisService {
  /**
   * 注入 Redis 客户端实例
   */
  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  /**
   * 根据键获取 Redis 中的值
   * @param key - 要获取的键
   * @returns 返回键对应的值
   */
  async get(key: string) {
    return await this.redisClient.get(key);
  }

  /**
   * 设置 Redis 中的键值对，可选择性设置过期时间
   * @param key - 要设置的键
   * @param value - 要设置的值
   * @param ttl - 可选参数，键值对的过期时间（秒）
   */
  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  /**
   * 根据键删除 Redis 中的值
   * @param key - 要删除的键
   */
  async del(key: string) {
    await this.redisClient.del(key);
  }

  /**
   * 将 Redis 中指定键的值递增 1
   * @param key - 要递增的键
   * @returns 返回递增后的值
   */
  async incr(key: string) {
    return await this.redisClient.incr(key);
  }

  /**
   * 将 Redis 中指定键的值递减 1
   * @param key - 要递减的键
   * @returns 返回递减后的值
   */
  async decr(key: string) {
    return await this.redisClient.decr(key);
  }

  /**
   * 获取 Redis 哈希表中指定字段的值
   * @param key - 哈希表的键
   * @param field - 要获取的字段名
   * @returns 返回字段对应的值
   */
  async hget(key: string, field: string) {
    return await this.redisClient.hGet(key, field);
  }

  /**
   * 设置 Redis 哈希表中指定字段的值，可选择性设置过期时间
   * @param key - 哈希表的键
   * @param field - 要设置的字段名
   * @param value - 要设置的值
   * @param ttl - 可选参数，哈希表的过期时间（秒）
   */
  async hset(key: string, field: string, value: string | number, ttl?: number) {
    await this.redisClient.hSet(key, field, value);
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  /**
   * 删除 Redis 哈希表中指定字段
   * @param key - 哈希表的键
   * @param field - 要删除的字段名
   */
  async hdel(key: string, field: string) {
    await this.redisClient.hDel(key, field);
  }

  /**
   * 获取 Redis 哈希表中所有字段和值
   * @param key - 哈希表的键
   * @returns 返回包含所有字段和值的对象
   */
  async hgetall(key: string) {
    return await this.redisClient.hGetAll(key);
  }
}
