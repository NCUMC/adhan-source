const routes = [
    {
        path: '/',
        component: () => import ('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                component: () => import ('pages/IndexPage.vue')
            },
            {
                path: 'prayer-time-update',
                component: () => import ('pages/PrayerTimeUpdatePage.vue')
            }
        ]
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import ('pages/ErrorNotFound.vue')
    }
]

export default routes
