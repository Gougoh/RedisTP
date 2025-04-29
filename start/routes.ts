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

router.get('/set-token', async ({ request }) => {
  const key = 'auth:token:12345'
  const value = request.input('value')
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

router.post('/create-session', async ({ request }) => {
  const { username, email, role } = request.body()
  const key = 'session:'+username
  const sessionData = {
    username: username,
    email: email,
    role: role
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

router.get('/session-ttl', async ({ request }) => {
  const key = 'session:'+request.input('user')
  const ttl = await redis.call('TTL', key)

  return {
    message: 'TTL trouvé',
    ttl
  }
})


router.post('/store-user-info', async ({ request }) => {
  const { user, infos } = request.body()
  const userKey = user

  await redis.call('HSET', userKey, 'name', infos.name, 'email', infos.email, 'city', infos.city)
  
  const fields = await redis.call('HKEYS', userKey)
  const values = await redis.call('HVALS', userKey)

  return {
    message: 'Infos utilisateur stocké',
    userKey,
    fields,   
    values    
  }
})


router.post('/create-cart', async ({ request }) => {
  console.log(request.body());
  const { user, items } = request.body()
  const key = `cart:${user}`
  
  for (const itemKey in items) {
    const product = items[itemKey]
      await redis.call('RPUSH', key, product)
  }

  const cartContent = await redis.call('LRANGE', key, 0, -1)

  return {
    message: 'Panier créé',
    cartContent
  }
})


router.get('/del-last-item', async ({ request }) => {
  const key = 'cart:'+request.input('user')

  const delItem = await redis.call('RPOP', key)
  const cartContent = await redis.call('LRANGE', key, 0, -1)

  return {
    message: 'Item supprimé',
    delItem,
    cartContent
  }
})


router.post('/set-stock', async ({ request }) => {
  const { product, stockVal } = request.body()
  const key = 'stock:'+product
  console.log(key);
  
  const stock = await redis.call('SET', key, stockVal)

  return {
    message: 'stock créé',
    stock
  }
})


router.post('/remove-from-stock', async ({ request }) => {
  const { product } = request.body()
  const key = 'stock:'+product
  
  await redis.call('DECR', key)

  const stock = await redis.call('GET', key)

  return {
    message: 'Item supprimé du stock',
    stock
  }
})


router.post('/transaction-ex', async ({ request }) => {
  const { stock1Name, stock2Name, user } = request.body()
  const keyStock1 = 'stock:product:'+stock1Name
  const keyStock2 = 'stock:product:'+stock2Name
  const cartKey = 'cart:'+user

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


router.post('/set-cart-timer', async ({ request }) => {
  const { user } = request.body()
  const cartKey = 'cart:'+user

  await redis.call('EXPIRE', cartKey, 900)
  const ttl = await redis.call('TTL', cartKey)

  return {
    message: 'Expirationde 15 minutes activée pour le panier',
    ttl
  }
})


router.post('/disconnect', async ({ request }) => {
  const { auth, session } = request.body()
  const authKey = 'auth:token:' + auth
  const sessionKey = 'session:' + session

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