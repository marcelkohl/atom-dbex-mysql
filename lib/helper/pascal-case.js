'use babel';

export default function pascalCase(words) {
  return words.split('_').map((w)=>{
    let wl = w.toLowerCase();
    return wl.charAt(0).toUpperCase() + wl.slice(1)
  }).join(' ');
}
