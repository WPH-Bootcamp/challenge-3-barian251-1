// ============================================
// HABIT TRACKER CLI - CHALLENGE 3
// ============================================
// NAMA: [WPH-047-Barian Karopeboka]
// KELAS: [BATCH REP]
// TANGGAL: [11 OKTOBER 2025]
// ============================================

// TODO: Import module yang diperlukan
// HINT: readline, fs, path
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// TODO: Definisikan konstanta
// HINT: DATA_FILE, REMINDER_INTERVAL, DAYS_IN_WEEK
const DATA_FILE = path.join(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000; // 10 detik
const DAYS_IN_WEEK = 7;

// TODO: Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================
// USER PROFILE OBJECT
// ============================================
// TODO: Buat object userProfile dengan properties:
// - name
// - joinDate
// - totalHabits
// - completedThisWeek
// TODO: Tambahkan method updateStats(habits)
// TODO: Tambahkan method getDaysJoined()

const userProfile = {
  name: 'Guest User',
  joinDate: new Date(),
  totalHabits: 0,
  completedThisWeek: 0,

  // Update statistik berdasarkan daftar habits
  updateStats(habits) {
    this.totalHabits = habits.length;
    const completed = habits.filter((h) => h.isCompletedThisWeek());
    this.completedThisWeek = completed.length;
  },

  // Menghitung sudah berapa hari sejak joinDate
  getDaysJoined() {
    const joined = new Date(this.joinDate);
    const now = new Date();
    const diffMs = now - joined;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days >= 0 ? days + 1 : 0; // +1 supaya hari pertama dihitung
  },
};

// ============================================
// HABIT CLASS
// ============================================
// TODO: Buat class Habit dengan:
// - Constructor yang menerima name dan targetFrequency
// - Method markComplete()
// - Method getThisWeekCompletions()
// - Method isCompletedThisWeek()
// - Method getProgressPercentage()
// - Method getStatus()

class Habit {
  constructor(name, targetFrequency) {
    this.id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.name = name;
    this.targetFrequency = Number(targetFrequency) || 0;
    this.completions = []; // array tanggal ISO string
    this.createdAt = new Date().toISOString();
  }

  // Tandai kebiasaan selesai untuk hari ini
  markComplete() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const already = this.completions.some((c) => {
      const d = new Date(c);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (!already) {
      this.completions.push(today.toISOString());
    }
  }

  // Ambil daftar completion dalam minggu ini
  getThisWeekCompletions() {
    const now = new Date();
    const day = now.getDay(); // 0 = Minggu, 1 = Senin
    const diffToMonday = (day + 6) % 7;

    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + (DAYS_IN_WEEK - 1));
    sunday.setHours(23, 59, 59, 999);

    return this.completions.filter((c) => {
      const d = new Date(c);
      return d >= monday && d <= sunday;
    });
  }

  // Cek apakah target minggu ini sudah tercapai
  isCompletedThisWeek() {
    const count = this.getThisWeekCompletions().length;
    return this.targetFrequency > 0 && count >= this.targetFrequency;
  }

  // Mendapatkan persen progres minggu ini
  getProgressPercentage() {
    if (!this.targetFrequency || this.targetFrequency <= 0) return 0;
    const count = this.getThisWeekCompletions().length;
    const percentage = Math.round((count / this.targetFrequency) * 100);
    return percentage > 100 ? 100 : percentage;
  }

  // Status teks
  getStatus() {
    return this.isCompletedThisWeek() ? 'Selesai' : 'Aktif';
  }
}

// ============================================
// HABIT TRACKER CLASS
// ============================================
// TODO: Buat class HabitTracker dengan:
// - Constructor
// - Method addHabit(name, frequency)
// - Method completeHabit(habitIndex)
// - Method deleteHabit(habitIndex)
// - Method displayProfile()
// - Method displayHabits(filter)
// - Method displayHabitsWithWhile()
// - Method displayHabitsWithFor()
// - Method displayStats()
// - Method startReminder()
// - Method showReminder()
// - Method stopReminder()
// - Method saveToFile()
// - Method loadFromFile()
// - Method clearAllData()

class HabitTracker {
  constructor() {
    this.habits = [];
    this.profile = userProfile;
    this.reminderTimer = null;
  }

  addHabit(name, frequency) {
    const habit = new Habit(name, frequency);
    this.habits.push(habit);
    this.profile.updateStats(this.habits);
    this.saveToFile();
    console.log(`Kebiasaan "${name}" berhasil ditambahkan.`);
  }

  completeHabit(habitIndex) {
    const habit = this.habits[habitIndex - 1] ?? null;
    if (!habit) {
      console.log('Nomor kebiasaan tidak valid.');
      return;
    }
    habit.markComplete();
    this.profile.updateStats(this.habits);
    this.saveToFile();
    console.log(`Kebiasaan "${habit.name}" ditandai selesai untuk hari ini.`);
  }

  deleteHabit(habitIndex) {
    const habit = this.habits[habitIndex - 1] ?? null;
    if (!habit) {
      console.log('Nomor kebiasaan tidak valid.');
      return;
    }
    this.habits.splice(habitIndex - 1, 1);
    this.profile.updateStats(this.habits);
    this.saveToFile();
    console.log(`Kebiasaan "${habit.name}" berhasil dihapus.`);
  }

  displayProfile() {
    this.profile.updateStats(this.habits);
    const daysJoined = this.profile.getDaysJoined();

    console.log('==================================================');
    console.log('PROFIL PENGGUNA');
    console.log('==================================================');
    console.log(`Nama              : ${this.profile.name}`);
    console.log(
      `Bergabung sejak   : ${new Date(
        this.profile.joinDate
      ).toLocaleDateString()}`
    );
    console.log(`Hari bergabung    : ${daysJoined} hari`);
    console.log(`Total Kebiasaan   : ${this.profile.totalHabits}`);
    console.log(`Selesai Minggu Ini: ${this.profile.completedThisWeek}`);
    console.log('==================================================');
  }

  displayHabits(filter = 'all') {
    if (this.habits.length === 0) {
      console.log('Belum ada kebiasaan. Tambahkan kebiasaan terlebih dahulu.');
      return;
    }

    let filtered = this.habits;
    if (filter === 'active') {
      filtered = this.habits.filter((h) => !h.isCompletedThisWeek());
    } else if (filter === 'completed') {
      filtered = this.habits.filter((h) => h.isCompletedThisWeek());
    }

    if (filtered.length === 0) {
      console.log('Tidak ada kebiasaan untuk kategori ini.');
      return;
    }

    filtered.forEach((habit, index) => {
      const weeklyCount = habit.getThisWeekCompletions().length;
      const target = habit.targetFrequency;
      const percentage = habit.getProgressPercentage();
      const bar = renderProgressBar(percentage);

      console.log(`${index + 1}. [${habit.getStatus()}] ${habit.name}`);
      console.log(`   Target       : ${target}x/minggu`);
      console.log(
        `   Progress     : ${weeklyCount}/${target} (${percentage}%)`
      );
      console.log(`   Progress Bar : ${bar} ${percentage}%`);
      console.log();
    });
  }

  // Demo while loop
  displayHabitsWithWhile() {
    if (this.habits.length === 0) {
      console.log('Belum ada kebiasaan.');
      return;
    }

    let i = 0;
    while (i < this.habits.length) {
      const habit = this.habits[i];
      console.log(`- ${habit.name} (${habit.getStatus()})`);
      i++;
    }
  }

  // Demo for loop
  displayHabitsWithFor() {
    if (this.habits.length === 0) {
      console.log('Belum ada kebiasaan.');
      return;
    }

    for (let i = 0; i < this.habits.length; i++) {
      const habit = this.habits[i];
      console.log(
        `${i + 1}. ${
          habit.name
        } - Progres minggu ini: ${habit.getProgressPercentage()}%`
      );
    }
  }

  displayStats() {
    console.log('==================================================');
    console.log('STATISTIK KEBIASAAN');
    console.log('==================================================');

    if (this.habits.length === 0) {
      console.log('Belum ada kebiasaan untuk dihitung statistiknya.');
      console.log('==================================================');
      return;
    }

    const totalHabits = this.habits.length;
    const completedThisWeek = this.habits.filter((h) =>
      h.isCompletedThisWeek()
    ).length;
    const activeThisWeek = totalHabits - completedThisWeek;

    const percentages = this.habits.map((h) => h.getProgressPercentage());
    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
    const avgPercentage = Math.round(totalPercentage / totalHabits);

    const bestHabit = this.habits.find(
      (h) => h.getProgressPercentage() === Math.max(...percentages)
    );

    console.log(`Total kebiasaan      : ${totalHabits}`);
    console.log(`Selesai minggu ini   : ${completedThisWeek}`);
    console.log(`Masih aktif          : ${activeThisWeek}`);
    console.log(`Rata-rata progres    : ${avgPercentage}%`);
    if (bestHabit) {
      console.log(
        `Kebiasaan terbaik    : ${
          bestHabit.name
        } (${bestHabit.getProgressPercentage()}%)`
      );
    }
    console.log('==================================================');
  }

  // Reminder System
  startReminder() {
    if (this.reminderTimer != null) return;
    this.reminderTimer = setInterval(() => {
      this.showReminder();
    }, REMINDER_INTERVAL);
  }

  showReminder() {
    const activeHabits = this.habits.filter((h) => !h.isCompletedThisWeek());
    if (activeHabits.length === 0) return;

    const randomIndex = Math.floor(Math.random() * activeHabits.length);
    const habit = activeHabits[randomIndex];

    console.log('==================================================');
    console.log(`REMINDER: Jangan lupa "${habit.name}"!`);
    console.log('==================================================');
  }

  stopReminder() {
    if (this.reminderTimer != null) {
      clearInterval(this.reminderTimer);
      this.reminderTimer = null;
    }
  }

  saveToFile() {
    const dataToSave = {
      profile: {
        name: this.profile.name,
        joinDate:
          this.profile.joinDate instanceof Date
            ? this.profile.joinDate.toISOString()
            : this.profile.joinDate,
        totalHabits: this.habits.length,
        completedThisWeek: this.habits.filter((h) => h.isCompletedThisWeek())
          .length,
      },
      habits: this.habits.map((habit) => ({
        id: habit.id,
        name: habit.name,
        targetFrequency: habit.targetFrequency,
        completions: habit.completions,
        createdAt: habit.createdAt,
      })),
    };

    try {
      const jsonData = JSON.stringify(dataToSave, null, 2);
      fs.writeFileSync(DATA_FILE, jsonData, 'utf8');
    } catch (err) {
      console.error('Gagal menyimpan data:', err.message);
    }
  }

  loadFromFile() {
    if (!fs.existsSync(DATA_FILE)) return;

    try {
      const jsonData = fs.readFileSync(DATA_FILE, 'utf8');
      if (!jsonData) return;

      const parsed = JSON.parse(jsonData ?? '{}');
      const habitsData = parsed.habits ?? [];
      const profileData = parsed.profile ?? null;

      this.habits = habitsData.map((item) => {
        const habit = new Habit(item.name, item.targetFrequency);
        habit.id = item.id ?? habit.id;
        habit.completions = item.completions ?? [];
        habit.createdAt = item.createdAt ?? new Date().toISOString();
        return habit;
      });

      if (profileData) {
        this.profile.name = profileData.name ?? this.profile.name;
        this.profile.joinDate = profileData.joinDate ?? this.profile.joinDate;
        this.profile.totalHabits =
          profileData.totalHabits ?? this.profile.totalHabits;
        this.profile.completedThisWeek =
          profileData.completedThisWeek ?? this.profile.completedThisWeek;
      }

      this.profile.updateStats(this.habits);
    } catch (err) {
      console.error('Gagal memuat data:', err.message);
    }
  }

  clearAllData() {
    this.habits = [];
    this.profile.totalHabits = 0;
    this.profile.completedThisWeek = 0;

    try {
      if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE);
      }
      console.log('Semua data berhasil dihapus.');
    } catch (err) {
      console.error('Gagal menghapus data:', err.message);
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
// TODO: Buat function askQuestion(question)

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

// TODO: Buat function displayMenu()

function displayMenu() {
  console.log('==================================================');
  console.log('HABIT TRACKER - MAIN MENU');
  console.log('==================================================');
  console.log('1. Lihat Profil');
  console.log('2. Lihat Semua Kebiasaan');
  console.log('3. Lihat Kebiasaan Aktif');
  console.log('4. Lihat Kebiasaan Selesai');
  console.log('5. Tambah Kebiasaan Baru');
  console.log('6. Tandai Kebiasaan Selesai');
  console.log('7. Hapus Kebiasaan');
  console.log('8. Lihat Statistik');
  console.log('9. Demo Loop (while/for)');
  console.log('0. Keluar');
  console.log('==================================================');
}

// Progress bar ASCII
function renderProgressBar(percentage, length = 10) {
  const filledBlocks = Math.round((percentage / 100) * length);
  let bar = '';
  for (let i = 0; i < length; i++) {
    bar += i < filledBlocks ? '█' : '░';
  }
  return bar;
}

// TODO: Buat async function handleMenu(tracker)

async function handleMenu(tracker) {
  let exit = false;

  while (!exit) {
    displayMenu();
    const choice = await askQuestion('Pilih menu (0-9): ');
    console.log();

    switch (choice.trim()) {
      case '1':
        tracker.displayProfile();
        break;

      case '2':
        tracker.displayHabits('all');
        break;

      case '3':
        tracker.displayHabits('active');
        break;

      case '4':
        tracker.displayHabits('completed');
        break;

      case '5': {
        const nameInput = await askQuestion('Masukkan nama kebiasaan baru: ');
        const freqInput = await askQuestion('Target per minggu (angka): ');
        const name = (nameInput && nameInput.trim()) ?? 'Kebiasaan Baru';
        const frequency = Number(freqInput ?? '0');
        tracker.addHabit(name, frequency);
        break;
      }

      case '6': {
        tracker.displayHabits('all');
        if (tracker.habits.length === 0) break;
        const idxStr = await askQuestion(
          'Pilih nomor kebiasaan yang ingin ditandai selesai hari ini: '
        );
        const idx = Number(idxStr);
        tracker.completeHabit(idx);
        break;
      }

      case '7': {
        tracker.displayHabits('all');
        if (tracker.habits.length === 0) break;
        const idxStr = await askQuestion(
          'Pilih nomor kebiasaan yang ingin dihapus: '
        );
        const idx = Number(idxStr);
        tracker.deleteHabit(idx);
        break;
      }

      case '8':
        tracker.displayStats();
        break;

      case '9':
        console.log('Demo while loop:');
        tracker.displayHabitsWithWhile();
        console.log('\nDemo for loop:');
        tracker.displayHabitsWithFor();
        break;

      case '0':
        exit = true;
        tracker.stopReminder();
        tracker.saveToFile();
        console.log(
          'Terima kasih telah menggunakan Habit Tracker. Sampai jumpa!'
        );
        break;

      default:
        console.log('Pilihan tidak dikenal. Silakan coba lagi.');
        break;
    }

    if (!exit) {
      await askQuestion('\nTekan Enter untuk kembali ke menu utama...');
      console.clear();
    }
  }

  rl.close();
  process.exit(0);
}

// ============================================
// MAIN FUNCTION
// ============================================
// TODO: Buat async function main()

async function main() {
  console.clear();
  console.log('==================================================');
  console.log('        SELAMAT DATANG DI HABIT TRACKER CLI       ');
  console.log('==================================================\n');

  const tracker = new HabitTracker();
  tracker.loadFromFile();
  tracker.startReminder();

  await handleMenu(tracker);
}

// TODO: Jalankan main() dengan error handling

main().catch((err) => {
  console.error('Terjadi kesalahan tak terduga:', err);
  rl.close();
  process.exit(1);
});
