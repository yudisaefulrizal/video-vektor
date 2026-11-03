import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {ROOT,checksum,writeJson,readJson} from './pipeline.mjs';
import {generateJSON} from './ai.mjs';
import {PLAN_SCHEMA,validateScript,validatePlan,compilePlan} from './contracts.mjs';

export async function createScript({title,p,regenerate=false,signal}){
 if(existsSync(p.script)&&!regenerate){const script=readJson(p.script);validateScript(script);return script;}
 const file=path.join(ROOT,'skill/pembuat-naskah.md');
 const skill=readFileSync(file,'utf8');
 // Substitute the input placeholder in memory; never rewrite the skill file.
 const instructions=skill.replace('[masukan judul disini]',title);
 const script=await generateJSON({instructions,input:`Tema: ${title}`,name:'naskah',validate:validateScript,signal});
 // This file is the source of truth, saved before TTS or video generation starts.
 writeJson(p.script,script);
 writeJson(p.metadata,{title,id:p.id,skill:'skill/pembuat-naskah.md',skillChecksum:checksum(file),scriptChecksum:checksum(p.script)});
 return script;
}

const DIRECTION=`Anda sutradara dan ilustrator animasi edukasi vektor, bekerja untuk renderer Remotion + Three.js yang sudah tetap.
Terjemahkan motion_description menjadi aset SVG dan keyframe konkret. Keluaran harus mengikuti schema JSON.
Video harus terasa sebagai cerita bergerak, bukan slide, dashboard, kartu ikon, atau halaman web.
Gunakan 12–24 shot jika durasi memungkinkan; variasikan wide, medium, detail, tracking, match cut dan aksi sebab-akibat.
Batas shot tidak wajib mengikuti batas kalimat. startScene adalah indeks kalimat nol-based, startProgress posisi 0–1 dalam kalimat tersebut.
Shot pertama wajib startScene=0, startProgress=0. Durasi shot mengikuti awal shot berikutnya; terakhir berakhir bersama film.
Tiap shot perlu gerak karakter/objek yang jelas. Gerak kamera dan zoom saja tidak cukup. Pertahankan identitas objek dan pose antarshot yang bersambung.
Gambar lingkungan mengisi layar 1920x1080, dengan objek utama cukup besar. Tanpa header, footer, nomor bab, atau jeda kosong.
Aset berupa markup bagian dalam SVG (tanpa tag svg), koordinat lokal -200 sampai 200 pada kedua sumbu, pusat di 0,0.
Buat aset yang memang menggambarkan judul: karakter, anggota tubuh terpisah, benda, pemandangan, bahan, atau diagram penjelas.
Jangan hanya membuat kumpulan lingkaran, kotak, ikon generik atau label teks. Gunakan path dengan bentuk yang terbaca dan palet konsisten.
SVG hanya elemen statis g/path/rect/circle/ellipse/polygon/polyline/line/defs/linearGradient/radialGradient/stop/clipPath/mask/text/tspan. Tanpa CSS style, event, gambar eksternal atau link. ID gradient/mask diawali ID aset.
Entity vector digambar 2D. Entity solid memakai geometri SVG diekstrusi Three.js; pilih objek bermakna seperti benda yang sedang diputar, dipotong, dibuka, atau diamati bentuknya. Minimal satu solid yang relevan.
layer back berada di belakang objek 3D, layer front berada di depannya. Semua posisi x/y dalam koordinat dunia piksel.
Camera x/y adalah pusat bidikan, zoom=1 menampilkan lebar 1920 dan tinggi1080. Semua animasi memakai keyframe at=0 sampai1.
Setiap pose harus memuat at,x,y,scale,rotation,rotationX,rotationY,opacity. Rotation dalam derajat; rotationX/Y hanya untuk solid. Scale1 menampilkan aset400x400.
Gunakan beberapa keyframe untuk langkah, lontaran, jatuh, kontak, atau napas; pecah anggota tubuh menjadi entity terpisah jika diperlukan.
Jangan memakai gambar poster jadi yang hanya digeser/di-zoom. Adegan harus mengalami perubahan keadaan yang memperjelas narasi.
keyText boleh null; jika ada ambil persis key_text dari sceneIndex, tampil singkat maksimal3detik, tidak selalu di posisi yang sama dan tidak menutup objek utama.
accent boleh null; jika ada, sinkronkan at dengan aksi bermakna (soft/impact/chime/water), bukan pergantian paragraf.
Awal tidak boleh berisi penantian kartu judul. Penutup menyelesaikan aksi dengan kamera bergerak lembut. Sisakan area bawah untuk takarir.`;

export async function createPlan({title,p,script,timeline,regenerate=false,feedback=null,signal}){
 const source=checksum(p.script);
 if(!regenerate&&existsSync(p.plan)){
  const previous=readJson(p.plan);
  if(previous.scriptChecksum===source){validatePlan(previous.plan,script);return compilePlan(previous.plan,timeline);}
 }
 const plan=await generateJSON({instructions:DIRECTION,input:JSON.stringify({title,script,qualityFeedback:feedback,timing:timeline.scenes.map(s=>({index:s.index,startSeconds:s.from/timeline.fps,seconds:s.durationInFrames/timeline.fps,audioLeadSeconds:s.audioLead/timeline.fps,words:s.captions.flatMap(c=>c.words)}))}),schema:PLAN_SCHEMA,name:'animation_plan',validate:data=>{validatePlan(data,script);compilePlan(data,timeline);},signal});
 writeJson(p.plan,{scriptChecksum:source,plan});
 return compilePlan(plan,timeline);
}
