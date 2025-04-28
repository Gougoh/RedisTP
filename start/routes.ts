/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import redis from '@adonisjs/redis/services/main'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/set-token', async () => {
  const key = 'auth:token:12345'
  const value = 'user42'
  const expireInSeconds = 7200

  await redis.call('SET', key, value, 'EX', expireInSeconds)

  const exists = await redis.call('EXISTS', key)
  if (!exists) {
    return { error: 'La clé n\'a pas été créée.' }
  }

  const ttl = await redis.call('TTL', key)
  if (ttl <= 0 || ttl > expireInSeconds) {
    return { error: `Le TTL est incorrect (${ttl} secondes)` }
  }

  return {
    message: 'Clé créée avec succès',
    key,
    value,
    ttl
  }
})

router.get('/create-session', async () => {
  const key = 'session:user42'
  const sessionData = {
    username: 'alice',
    email: 'alice@example.com',
    role: 'user'
  }
  const expireInSeconds = 1800

  const jsonData = JSON.stringify(sessionData)

  await redis.call('SET', key, jsonData, 'EX', expireInSeconds)

  const exists = await redis.call('EXISTS', key)
  if (!exists) {
    return { error: 'Session non créée.' }
  }

  return {
    message: 'Session stockée avec succès',
    key,
    sessionData
  }
})

router.get('/session-ttl', async () => {
  const key = 'session:user42'
  const ttl = await redis.call('TTL', key)

  return {
    message: 'TTL trouvé',
    ttl
  }
})


router.get('/store-user-info', async () => {
  const userKey = 'user42'

  await redis.call('HSET', userKey, 'name', 'Alice', 'email', 'alice@example.com', 'city', 'Paris')
  const fields = await redis.call('HKEYS', userKey)
  const values = await redis.call('HVALS', userKey)

  return {
    message: 'Infos utilisateur stocké',
    userKey,
    fields,   
    values    
  }
})


router.get('/create-cart', async () => {
  const key = 'cart:user42'

  await redis.call('RPUSH', key, 'product:1001')
  await redis.call('RPUSH', key, 'product:1002')
  await redis.call('RPUSH', key, 'product:1003')

  const cartContent = await redis.call('LRANGE', key, 0, -1)

  return {
    message: 'Panier créé',
    cartContent
  }
})


router.get('/del-last-item', async () => {
  const key = 'cart:user42'

  const delItem = await redis.call('RPOP', key)
  const cartContent = await redis.call('LRANGE', key, 0, -1)

  return {
    message: 'Item supprimé',
    delItem,
    cartContent
  }
})


router.get('/set-stock', async () => {
  const key = 'stock:product:1001'

  const stock = await redis.call('SET', key, 50)

  return {
    message: 'stock créé',
    stock
  }
})


router.get('/remove-from-stock', async () => {
  const key = 'stock:product:1001'

  await redis.call('DECR', key)

  const stock = await redis.call('GET', key)

  return {
    message: 'Item supprimé du stock',
    stock
  }
})


router.get('/transaction-ex', async () => {
  const keyStock1 = 'stock:product:1002'
  const keyStock2 = 'stock:product:1003'
  const cartKey = 'cart:user42'

  await redis.call('SET', keyStock1, 50)
  await redis.call('SET', keyStock2, 50)

  await redis.call('MULTI')
  
  await redis.call('DECR', keyStock1)
  await redis.call('DECR', keyStock2)

  await redis.call('RPUSH', cartKey, keyStock1)
  await redis.call('RPUSH', cartKey, keyStock2)

  await redis.call('EXEC')

  const cartContent = await redis.call('LRANGE', cartKey, 0, -1)
  const stock1 = await redis.call('GET', keyStock1)
  const stock2 = await redis.call('GET', keyStock2)

  return {
    message: 'Items ajoutés au panier',
    cartContent,
    stock1,
    stock2
  }
})


router.get('/set-cart-timer', async () => {
  const cartKey = 'cart:user42'

  await redis.call('EXPIRE', cartKey, 900)
  const ttl = await redis.call('TTL', cartKey)

  return {
    message: 'Expirationde 15 minutes activée pour le panier',
    ttl
  }
})


router.get('/disconnect', async () => {
  const authKey = 'auth:token:12345'
  const sessionKey = 'session:user42'

  await redis.call('DEL', authKey, sessionKey)

  const existsToken = await redis.call('EXISTS', authKey)
  if (existsToken) {
    return { error: 'Token non supprimé' }
  }

  const existsSession = await redis.call('EXISTS', sessionKey)
  if (existsSession) {
    return { error: 'Session non supprimée' }
  }

  return {
    message: 'Déconnexion réussie'
  }
})