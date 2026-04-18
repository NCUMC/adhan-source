<template>
  <q-page class="prayer-update-page">
    <nav class="top-nav">
      <div class="content-wrap nav-inner">
        <div class="club-title">NCU Muslim Club</div>
        <div class="lang-switch">
          <q-btn
            dense
            no-caps
            unelevated
            label="EN"
            :color="lang === 'en' ? 'teal-6' : 'grey-9'"
            :text-color="lang === 'en' ? 'white' : 'grey-4'"
            @click="setLanguage('en')"
          />
          <q-btn
            dense
            no-caps
            unelevated
            label="ID"
            :color="lang === 'id' ? 'teal-6' : 'grey-9'"
            :text-color="lang === 'id' ? 'white' : 'grey-4'"
            @click="setLanguage('id')"
          />
        </div>
      </div>
    </nav>

    <section class="content-wrap hero q-my-lg">
      <div class="badge">{{ tr(copy.badge) }}</div>
      <h1 class="hero-title">{{ tr(copy.title) }}</h1>
      <p class="hero-subtitle">{{ tr(copy.subtitle) }}</p>
    </section>

    <section class="content-wrap guidance-grid q-my-lg">
      <q-card
        v-for="(item, idx) in guidance"
        :key="`guide-${idx}`"
        flat
        bordered
        class="guidance-card"
      >
        <q-card-section>
          <div class="arabic-ayah">{{ item.arabic }}</div>
          <p class="guidance-text">{{ tr(item.translation) }}</p>
        </q-card-section>
      </q-card>
    </section>

    <section class="content-wrap q-pb-xl q-my-lg">
      <q-card flat bordered class="tabs-card">
        <q-card-section class="tabs-head">
          <q-btn
            v-for="tab in tabs"
            :key="tab.id"
            no-caps
            flat
            :class="['tab-btn', { 'tab-btn-active': activeTab === tab.id }]"
            @click="activeTab = tab.id"
            :label="tr(tab.label)"
          />
        </q-card-section>

        <q-card-section class="tabs-body">
          <div v-if="activeTab === 'calc'" class="tab-panel">
            <h3 class="panel-title">MWL Standard</h3>
            <p>{{ tr(copy.calcBody) }}</p>
          </div>

          <div v-else-if="activeTab === 'iqomah'" class="tab-panel iqomah-grid">
            <q-card flat bordered class="mini-card">
              <q-card-section>
                <div class="mini-title">Subuh / Fajr</div>
                <div class="mini-time">20 min</div>
              </q-card-section>
            </q-card>
            <q-card flat bordered class="mini-card mini-card-highlight">
              <q-card-section>
                <div class="mini-title">Maghrib</div>
                <div class="mini-time">15 min</div>
                <div class="mini-note">{{ tr(copy.maghribNote) }}</div>
              </q-card-section>
            </q-card>
            <q-card flat bordered class="mini-card">
              <q-card-section>
                <div class="mini-title">Ashar & Isya</div>
                <div class="mini-time">10 min</div>
              </q-card-section>
            </q-card>
          </div>

          <div v-else-if="activeTab === 'dhuhr'" class="tab-panel">
            <h3 class="panel-title">Fixed Iqomah</h3>
            <p>{{ tr(copy.dhuhrBody) }}</p>
          </div>

          <div v-else-if="activeTab === 'maghrib'" class="tab-panel">
            <h3 class="panel-title">3 Min Buffer (Ihtiyat)</h3>
            <p>{{ tr(copy.maghribBody) }}</p>
          </div>

          <div v-else class="tab-panel">
            <h3 class="panel-title">Shafi'i / Jumhur</h3>
            <p>{{ tr(copy.asrBody) }}</p>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <section class="content-wrap q-pb-xl q-my-lg">
      <h2 class="section-title">{{ tr(copy.considerTitle) }}</h2>
      <div class="consider-grid">
        <q-card
          v-for="item in considerations"
          :key="item.icon"
          flat
          bordered
          class="consider-card"
        >
          <q-card-section>
            <div class="consider-icon">{{ item.icon }}</div>
            <h4 class="consider-head">{{ tr(item.title) }}</h4>
            <p class="consider-text">{{ tr(item.body) }}</p>
          </q-card-section>
        </q-card>
      </div>
    </section>

    <section class="content-wrap q-pb-xl q-my-lg">
      <div class="cache-block">
        <h2 class="section-title dark-title">{{ tr(copy.cacheTitle) }}</h2>
        <p class="cache-intro">{{ tr(copy.cacheIntro) }}</p>
        <div class="cache-grid">
          <q-card flat bordered class="cache-card">
            <q-card-section>
              <h4 class="cache-head">Desktop</h4>
              <p>{{ tr(copy.cacheDesktopWindows) }}</p>
              <p>{{ tr(copy.cacheDesktopMac) }}</p>
            </q-card-section>
          </q-card>
          <q-card flat bordered class="cache-card">
            <q-card-section>
              <h4 class="cache-head">Android (Chrome)</h4>
              <p>{{ tr(copy.cacheAndroid) }}</p>
              <a href="https://support.google.com/chrome/answer/2392709" target="_blank" rel="noopener" class="cache-link">
                Google Support
              </a>
            </q-card-section>
          </q-card>
          <q-card flat bordered class="cache-card">
            <q-card-section>
              <h4 class="cache-head">iPhone/iPad (Safari)</h4>
              <p>{{ tr(copy.cacheIos) }}</p>
              <a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener" class="cache-link">
                Apple Support
              </a>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <section class="content-wrap q-pb-xl q-my-lg">
      <q-card flat class="hadith-block">
        <q-card-section>
          <h2 class="hadith-title">{{ tr(copy.hadithTitle) }}</h2>
          <p class="hadith-quote">{{ tr(copy.hadithQuote) }}</p>
          <p class="hadith-body">{{ tr(copy.hadithBody) }}</p>
        </q-card-section>
      </q-card>
    </section>

    <section class="implementation q-my-lg">
      <div class="content-wrap implementation-inner">
        <h2 class="implementation-title">Implementation</h2>
        <q-card flat bordered class="implementation-card">
          <q-card-section>
            <div class="implementation-icon">📱</div>
            <h3 class="implementation-head">Official Adhan App</h3>
            <div class="implementation-sub">NCU Muslim Club</div>
            <q-btn
              unelevated
              no-caps
              color="white"
              text-color="teal-9"
              label="Open Adhan PWA"
              href="https://ncumc.github.io/adhan"
              target="_blank"
              rel="noopener"
            />
            <p class="implementation-note">{{ tr(copy.implementationNote) }}</p>
          </q-card-section>
        </q-card>
      </div>
    </section>

    <footer class="page-footer">
      <div class="content-wrap">
        <p class="footer-title">Khadim NCU Muslim Club (NCUMC)</p>
        <p class="footer-text">{{ tr(copy.footerBody) }}</p>
      </div>
    </footer>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PrayerTimeUpdatePage',
  data () {
    return {
      lang: 'en',
      activeTab: 'calc',
      tabs: [
        { id: 'calc', label: { en: '1. Calculation', id: '1. Kalkulasi' } },
        { id: 'iqomah', label: { en: '2. Iqomah Interval', id: '2. Jeda Iqomah' } },
        { id: 'dhuhr', label: { en: '3. Dhuhr', id: '3. Dzuhur' } },
        { id: 'maghrib', label: { en: '4. Maghrib', id: '4. Maghrib' } },
        { id: 'asr', label: { en: '5. Juristic', id: '5. Mazhab' } }
      ],
      guidance: [
        {
          arabic: 'إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَـٰبًۭا مَّوْقُوتًۭا',
          translation: {
            en: '"Indeed, prayer has been decreed upon the believers a decree of specified times." (An-Nisa: 103)',
            id: '"Sesungguhnya shalat itu adalah fardhu yang ditentukan waktunya atas orang-orang yang beriman." (QS. An-Nisa: 103)'
          }
        },
        {
          arabic: 'وَٱعْتَصِمُوا۟ بِحَبْلِ ٱللَّهِ جَمِيعًۭا وَلَا تَفَرَّقُوا۟',
          translation: {
            en: '"And hold firmly to the rope of Allah all together and do not become divided..." (Ali Imran: 103)',
            id: '"Dan berpegang teguhlah kamu semuanya pada tali (agama) Allah, dan janganlah kamu bercerai berai..." (QS. Ali Imran: 103)'
          }
        }
      ],
      considerations: [
        {
          icon: '🌙',
          title: { en: 'Fajr Accuracy', id: 'Akurasi Fajar' },
          body: {
            en: 'The 18° MWL standard provides stronger certainty for the validity of Imsak and Fajr.',
            id: 'Standard 18° MWL memberikan kepastian lebih kuat untuk validitas Imsak dan Subuh.'
          }
        },
        {
          icon: '🎓',
          title: { en: 'Academic Schedule', id: 'Jadwal Kuliah' },
          body: {
            en: 'Fixing Dhuhr at 12:15 PM is a compromise for students finishing classes at 12 PM.',
            id: 'Penetapan 12:15 PM untuk Dzuhur adalah kompromi bagi mahasiswa yang selesai kelas pukul 12.'
          }
        },
        {
          icon: '🤝',
          title: { en: 'Community Unity', id: 'Kesatuan Komunitas' },
          body: {
            en: 'Aligning with PCINU/PCIM to facilitate coordination of cross-community events.',
            id: 'Menyelaraskan waktu dengan PCINU/PCIM agar memudahkan koordinasi acara lintas komunitas.'
          }
        },
        {
          icon: '📍',
          title: { en: 'Taiwan Context', id: 'Konteks Taiwan' },
          body: {
            en: 'Ensuring compatibility with local mosques while maintaining our fiqh standards.',
            id: 'Menjamin kompatibilitas dengan masjid-masjid lokal sambil tetap menjaga standar fiqih kita.'
          }
        }
      ],
      copy: {
        badge: {
          en: 'Official Announcement for NCU Community',
          id: 'Pengumuman Resmi untuk Komunitas NCU'
        },
        title: {
          en: 'New Congregational Prayer Standard',
          id: 'Standard Baru Jadwal Sholat Jama\'ah'
        },
        subtitle: {
          en: 'Presented by Khadim NCU Muslim Club, this announcement details the transition to the MWL standard to optimize worship on campus.',
          id: 'Disampaikan oleh Khadim NCU Muslim Club, pengumuman ini merinci transisi ke standar Muslim World League (MWL) guna mengoptimalkan ibadah di kampus.'
        },
        calcBody: {
          en: 'We adopt the MWL (Fajr 18°, Isha 17°) standard. This provides a safe margin for Fajr and Imsak, aligning with major Muslim organizations in Taiwan.',
          id: 'Kita mengadopsi standar MWL (Fajr 18°, Isha 17°). Ini memberikan margin aman untuk Subuh dan Imsak, serta selaras dengan referensi organisasi besar di Taiwan.'
        },
        maghribNote: {
          en: '*Changed from 20m',
          id: '*Berubah dari 20m'
        },
        dhuhrBody: {
          en: 'Dhuhr Iqomah starts at a minimum of 12:15 PM. This ensures students finishing classes at 12:00 PM have time to join the congregation.',
          id: 'Iqomah Dzuhur dimulai minimal pukul 12:15 PM. Penyesuaian ini agar teman-teman yang selesai kelas pukul 12:00 PM sempat bergabung dalam jama\'ah.'
        },
        maghribBody: {
          en: 'We add a 3-minute safety buffer (Ihtiyat) for Maghrib. This is to ensure the validity of fast-breaking and prayer time after astronomical sunset.',
          id: 'Kami menambahkan 3 menit waktu aman (Ihtiyat) untuk Maghrib. Ini untuk menjamin keabsahan waktu buka puasa dan sholat setelah matahari terbenam secara astronomis.'
        },
        asrBody: {
          en: 'We use the Shafi\'i method for Asr. Our Hanafi brothers have agreed for the sake of community unity and to prevent Dhuhr from being pushed too late.',
          id: 'Kita menggunakan metode Syafi\'i untuk Ashar. Saudara-saudara bermazhab Hanafi telah setuju demi menjaga persatuan jama\'ah kampus dan mencegah Dzuhur yang terlalu mundur.'
        },
        considerTitle: {
          en: 'Considerations for the Change',
          id: 'Pertimbangan Perubahan'
        },
        cacheTitle: {
          en: 'How to Update (Clear Cache)',
          id: 'Cara Update (Clear Cache)'
        },
        cacheIntro: {
          en: 'To ensure the latest schedule appears in the Adhan app, follow these guides according to your device.',
          id: 'Untuk memastikan jadwal terbaru muncul di aplikasi Adhan, ikuti panduan berikut sesuai perangkat Anda.'
        },
        cacheDesktopWindows: {
          en: 'Windows: Press Ctrl + F5',
          id: 'Windows: Tekan Ctrl + F5'
        },
        cacheDesktopMac: {
          en: 'macOS (Safari/Chrome): Press Cmd + Shift + R',
          id: 'macOS (Safari/Chrome): Tekan Cmd + Shift + R'
        },
        cacheAndroid: {
          en: 'Menu (three dots) > History > Clear browsing data > Cached images and files.',
          id: 'Menu (tiga titik) > Riwayat > Hapus data browsing > Cached images and files.'
        },
        cacheIos: {
          en: 'Settings > Safari > Clear History and Website Data.',
          id: 'Settings > Safari > Clear History and Website Data.'
        },
        hadithTitle: {
          en: 'Prophetic Foundation',
          id: 'Landasan Hadits'
        },
        hadithQuote: {
          en: '"Prayer in congregation is twenty-seven times more rewarding than prayer performed individually." (Bukhari & Muslim)',
          id: '"Shalat berjamaah lebih utama dua puluh tujuh derajat daripada shalat sendirian." (HR. Bukhari & Muslim)'
        },
        hadithBody: {
          en: 'NCUMC strives to facilitate this reward by arranging inclusive iqomah schedules for all students.',
          id: 'NCUMC berupaya memfasilitasi keutamaan ini dengan mengatur jadwal iqomah yang inklusif bagi seluruh mahasiswa.'
        },
        implementationNote: {
          en: '*Please reload the PWA for latest updates.',
          id: '*Mohon reload halaman PWA untuk update terbaru.'
        },
        footerBody: {
          en: 'Exclusively for the Muslim community at National Central University (NCU).',
          id: 'Ditujukan khusus bagi komunitas Muslim di National Central University (NCU).'
        }
      }
    }
  },
  methods: {
    setLanguage (lang) {
      this.lang = lang
    },
    tr (content) {
      return content[this.lang] || content.en
    }
  }
})
</script>

<style scoped>
.prayer-update-page {
  background: #fafaf9;
  color: #1c1917;
  min-height: 100vh;
}

.content-wrap {
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 16px;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #134e4a;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.nav-inner {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.club-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.lang-switch {
  display: flex;
  gap: 8px;
}

.hero {
  text-align: center;
  padding-top: 56px;
  padding-bottom: 36px;
}

.badge {
  display: inline-block;
  border-radius: 999px;
  padding: 6px 14px;
  background: #ccfbf1;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
}

.hero-title {
  margin: 18px 0;
  font-size: clamp(28px, 5vw, 48px);
  line-height: 1.1;
  font-weight: 800;
}

.hero-subtitle {
  margin: 0 auto;
  max-width: 760px;
  color: #57534e;
  font-size: clamp(15px, 2vw, 20px);
}

.guidance-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding-bottom: 24px;
}

.guidance-card {
  border-radius: 16px;
}

.arabic-ayah {
  text-align: center;
  color: #0f766e;
  font-size: 30px;
  margin-bottom: 12px;
  font-family: 'Amiri', serif;
}

.guidance-text {
  margin: 0;
  text-align: center;
  color: #57534e;
  font-style: italic;
}

.tabs-card {
  border-radius: 16px;
  overflow: hidden;
}

.tabs-head {
  background: #f5f5f4;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tab-btn {
  border-radius: 8px;
  color: #57534e;
}

.tab-btn-active {
  background: #ccfbf1;
  color: #0f766e;
}

.tabs-body {
  min-height: 220px;
}

.panel-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 28px;
  font-weight: 700;
}

.tab-panel p {
  margin: 0;
  color: #44403c;
  line-height: 1.7;
}

.iqomah-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.mini-card {
  border-radius: 12px;
  background: #fafaf9;
}

.mini-card-highlight {
  background: #f0fdfa;
  border-color: #99f6e4;
}

.mini-title {
  color: #0f766e;
  font-weight: 700;
}

.mini-time {
  font-size: 34px;
  font-weight: 800;
}

.mini-note {
  color: #0f766e;
  font-size: 12px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 18px;
}

.consider-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.consider-card {
  border-radius: 14px;
}

.consider-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.consider-head {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
}

.consider-text {
  margin: 0;
  color: #57534e;
  font-size: 14px;
}

.cache-block {
  border-radius: 24px;
  padding: 28px;
  background: #1c1917;
}

.dark-title {
  color: #2dd4bf;
}

.cache-intro {
  color: #d6d3d1;
  margin: 0 0 16px;
}

.cache-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.cache-card {
  border-color: #44403c;
  background: #292524;
  color: #e7e5e4;
  border-radius: 14px;
}

.cache-head {
  margin-top: 0;
  font-size: 18px;
  font-weight: 700;
}

.cache-link {
  color: #2dd4bf;
  text-decoration: none;
}

.cache-link:hover {
  text-decoration: underline;
}

.hadith-block {
  border-radius: 18px;
  background: #f0fdfa;
  border-left: 6px solid #14b8a6;
}

.hadith-title {
  margin-top: 0;
  margin-bottom: 8px;
  color: #134e4a;
  font-size: 24px;
}

.hadith-quote {
  margin: 0 0 10px;
  color: #44403c;
  font-style: italic;
}

.hadith-body {
  margin: 0;
  color: #57534e;
}

.implementation {
  background: #134e4a;
  color: #ffffff;
  padding: 54px 0;
}

.implementation-inner {
  text-align: center;
}

.implementation-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 36px;
  font-weight: 700;
}

.implementation-card {
  max-width: 720px;
  margin: 0 auto;
  border-radius: 16px;
  border-color: #0f766e;
  background: #115e59;
}

.implementation-icon {
  font-size: 42px;
  margin-bottom: 8px;
}

.implementation-head {
  margin: 0;
  font-size: 28px;
}

.implementation-sub {
  margin-bottom: 16px;
  color: #99f6e4;
}

.implementation-note {
  margin-top: 16px;
  color: #99f6e4;
  font-size: 13px;
}

.page-footer {
  background: #1c1917;
  color: #a8a29e;
  text-align: center;
  padding: 28px 0 36px;
}

.footer-title {
  margin: 0 0 6px;
  color: #14b8a6;
  font-weight: 700;
}

.footer-text {
  margin: 0;
}

@media (max-width: 1023px) {
  .guidance-grid {
    grid-template-columns: 1fr;
  }

  .consider-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cache-grid {
    grid-template-columns: 1fr;
  }

  .iqomah-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 599px) {
  .club-title {
    font-size: 16px;
  }

  .section-title {
    font-size: 26px;
  }

  .consider-grid {
    grid-template-columns: 1fr;
  }

  .cache-block {
    padding: 18px;
  }

  /* #q-app .prayer-update-page section.content-wrap {
    margin-top: 20px;
    margin-bottom: 20px;
  } */
}
</style>
