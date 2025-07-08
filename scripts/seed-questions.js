// scripts/seed-questions.js
import 'dotenv/config';// Pastikan path ke .env benar

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// --- Data Materi (Sesuaikan ID dengan materi di DB Anda) ---
// Pastikan ID materi ini sesuai dengan ID yang sudah ada di tabel 'materi' Anda.
// Jika ID materi Anda di DB adalah UUID, ganti tipe ID di sini menjadi string UUID.
const MATERI_IDS = {
  'Kata Kerja "To Be"': 1,  // Ganti dengan ID materi 'Kata Kerja "To Be"' di DB Anda
  'Simple Present Tense': 2, // Ganti dengan ID materi 'Simple Present Tense' di DB Anda
  'Personal Pronouns': 3,    // Ganti dengan ID materi 'Personal Pronouns' di DB Anda
  'Nouns (Singular/Plural)': 4,
  'Present Continuous Tense': 5,
  'Simple Past Tense': 6,
  'Present Perfect Tense': 7,
  'Modal Verbs': 8,
  'Comparatives & Superlatives': 9,
};

// --- Data Soal yang Akan Diinput ---
const questionsToSeed = [
// --- Personal Pronouns ---
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: '____ is my best friend. His name is John.',
  tipe_pertanyaan: 'pilihan_ganda',
  opsi: { a: 'He', b: 'She', c: 'It', d: 'They' },
  jawaban_benar: 'a',
  penjelasan: 'John adalah laki-laki tunggal, jadi pakai "He".',
  level: 1,
  is_ai_generated: false,
},
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: '____ are going to the mall together.',
  tipe_pertanyaan: 'isian_kosong',
  jawaban_benar: 'We',
  penjelasan: '"We" digunakan untuk menyatakan diri sendiri bersama orang lain.',
  level: 1,
  is_ai_generated: false,
},
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: '“It” digunakan untuk manusia.',
  tipe_pertanyaan: 'benar_salah',
  jawaban_benar: 'salah',
  penjelasan: '"It" hanya digunakan untuk benda atau hewan, bukan manusia.',
  level: 1,
  is_ai_generated: false,
},
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: 'My sister and I love chocolate. ____ eat it every day.',
  tipe_pertanyaan: 'isian_kosong',
  jawaban_benar: 'We',
  penjelasan: 'Subjek “My sister and I” = “We”.',
  level: 1,
  is_ai_generated: false,
},
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: 'Choose the correct pronoun for: “My name is Lisa. ___ am a nurse.”',
  tipe_pertanyaan: 'pilihan_ganda',
  opsi: { a: 'She', b: 'They', c: 'I', d: 'You' },
  jawaban_benar: 'c',
  penjelasan: '"I" digunakan untuk menyebut diri sendiri.',
  level: 1,
  is_ai_generated: false,
},
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: 'They is happy.',
  tipe_pertanyaan: 'benar_salah',
  jawaban_benar: 'salah',
  penjelasan: '“They” menggunakan “are”, bukan “is”.',
  level: 1,
  is_ai_generated: false,
},
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: 'My dog is hungry. ____ wants to eat.',
  tipe_pertanyaan: 'pilihan_ganda',
  opsi: { a: 'He', b: 'She', c: 'It', d: 'They' },
  jawaban_benar: 'c',
  penjelasan: '“It” digunakan untuk hewan jika jenis kelaminnya tidak disebut.',
  level: 1,
  is_ai_generated: false,
},
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: 'You and Tom are good at basketball. = ____ are good at basketball.',
  tipe_pertanyaan: 'isian_kosong',
  jawaban_benar: 'You',
  penjelasan: '“You” juga dipakai untuk jamak (You and Tom).',
  level: 1,
  is_ai_generated: false,
},
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: 'He and I are friends. = ____ are friends.',
  tipe_pertanyaan: 'pilihan_ganda',
  opsi: { a: 'We', b: 'They', c: 'You', d: 'It' },
  jawaban_benar: 'a',
  penjelasan: '"He and I" diganti dengan "We".',
  level: 1,
  is_ai_generated: false,
},
{
  topic_id: MATERI_IDS['Personal Pronouns'],
  text_pertanyaan: '“She” digunakan untuk perempuan tunggal.',
  tipe_pertanyaan: 'benar_salah',
  jawaban_benar: 'benar',
  penjelasan: 'Betul, “She” adalah pronoun untuk perempuan tunggal.',
  level: 1,
  is_ai_generated: false,
},


  // ... Tambahkan soal untuk materi lain dengan pola yang sama ...
];

// --- Fungsi untuk Menginput Soal ---
async function seedQuestions() {
  console.log('Starting to seed questions...');
  let successCount = 0;
  let errorCount = 0;

  for (const q of questionsToSeed) {
    try {
      const { data, error } = await supabaseAdmin.from('soal_latihan').insert([q]); // Menggunakan nama tabel 'soal_latihan'
      if (error) {
        console.error(`Failed to insert question: ${q.text_pertanyaan}`, error.message);
        errorCount++;
      } else {
        console.log(`Successfully inserted question: ${q.text_pertanyaan}`);
        successCount++;
      }
    } catch (e) {
      console.error(`Unexpected error for question: ${q.text_pertanyaan}`, e.message);
      errorCount++;
    }
  }

  console.log(`\nSeeding complete: ${successCount} questions inserted, ${errorCount} failed.`);
  process.exit(0); // Keluar dari proses Node.js
}

seedQuestions();