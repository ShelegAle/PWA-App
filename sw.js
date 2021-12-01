const staticCacheName = 's-app-v1'
const dynamicCacheName = 'd-app-v1'

const assetUrl = [
    'index.html',
    '/js/app.js',
    '/css/style.css',
    'offline.html'
]

self.addEventListener('install', async event => {
    console.log('[SW]: install');

    const cache = await caches.open(staticCacheName)
    await cache.addAll(assetUrl)
})

self.addEventListener('activate', async event => {
    console.log('[SW]: activate');
    const cacheName = await caches.keys()
    await Promise.all(
        cacheName
        .filter(name => name !== staticCacheName)
        .filter(name => name !== dynamicCacheName)
        .map(name => caches.delete(name))
    )

})

self.addEventListener('fetch', event => {
    console.log('Fetch', event.request.url);

    const {request} = event

    const url = new URL(request.url)
    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(event.request))
    } else {
        event.respondWith(networkFirst(request))
    }

})

async function cacheFirst(request) {
    const  cached = await caches.match(request)
    return cached ?? await fetch(request)
}

async function networkFirst(request) {
    const cache = await caches.open(dynamicCacheName)
    try {
        const response = await fetch(request)
        await cache.put(request, response.clone())
        return response
    } catch (e) {
        const cached = await cache.match(request)
        return cached ?? caches,match('/offline.html')
    }
}