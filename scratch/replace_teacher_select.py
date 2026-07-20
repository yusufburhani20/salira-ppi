import re

file_path = "resources/js/Pages/Admin/Reports/Index.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Normalize line 160 if it has '&& activeTab !== \'agenda\''
content = content.replace(
    "{(activeTab !== 'consultation' && activeTab !== 'agenda') && (",
    "{(activeTab !== 'consultation') && ("
)

# 2. Locate the teacher select block under activeTab === 'agenda'
# We will use regex to find the select block and replace it.
pattern = r'({\s*activeTab\s*===\s*\'agenda\'\s*&&\s*\(\s*<div\s+className="relative">\s*<select\s+value=\{data\.teacher_id\}[^<]*<\/select>\s*<\/div>\s*\)})'

replacement = """{activeTab === 'agenda' && (
                                         <div className="relative">
                                             <button
                                                 type="button"
                                                 onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                                                 className="w-full h-12 px-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-all text-left flex items-center justify-between font-bold text-sm"
                                             >
                                                 <span className="truncate">
                                                     {data.teacher_ids.length === 0
                                                         ? '-- Semua Guru --'
                                                         : `${data.teacher_ids.length} Guru Terpilih`}
                                                 </span>
                                                 <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                                             </button>

                                             {showTeacherDropdown && (
                                                 <>
                                                     <div className="fixed inset-0 z-20" onClick={() => setShowTeacherDropdown(false)} />
                                                     <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl p-2 space-y-1">
                                                         <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer font-bold text-xs text-gray-700 dark:text-gray-300">
                                                             <input
                                                                 type="checkbox"
                                                                 checked={data.teacher_ids.length === 0}
                                                                 onChange={() => setData('teacher_ids', [])}
                                                                 className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                             />
                                                             <span>-- Semua Guru --</span>
                                                         </label>
                                                         {teachers.map(t => {
                                                             const isChecked = data.teacher_ids.includes(t.id.toString());
                                                             return (
                                                                 <label key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer font-semibold text-xs text-gray-700 dark:text-gray-300">
                                                                     <input
                                                                         type="checkbox"
                                                                         checked={isChecked}
                                                                         onChange={(e) => {
                                                                             if (e.target.checked) {
                                                                                 setData('teacher_ids', [...data.teacher_ids, t.id.toString()]);
                                                                             } else {
                                                                                 setData('teacher_ids', data.teacher_ids.filter(id => id !== t.id.toString()));
                                                                             }
                                                                         }}
                                                                         className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                                     />
                                                                     <span>{t.name}</span>
                                                                 </label>
                                                             );
                                                         })}
                                                     </div>
                                                 </>
                                             )}
                                         </div>
                                     )}"""

# Since line endings might be CRLF, we normalize spaces/newlines in regex.
# Let's perform a direct string replacement if regex is too tricky, or a reliable regex.
# We will do a direct search for the select tag part:
target_select = """                                     {activeTab === 'agenda' && (
                                         <div className="relative">
                                             <select
                                                 value={data.teacher_id}
                                                 onChange={e => setData('teacher_id', e.target.value)}
                                                 className="w-full h-12 pl-4 pr-10 rounded-xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] font-bold text-sm"
                                                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                             >
                                                 <option value="">-- Semua Guru --</option>
                                                 {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                             </select>
                                         </div>
                                     )}"""

# Normalize CRLF in target_select
target_select_lf = target_select.replace("\\r\\n", "\\n")
content_lf = content.replace("\\r\\n", "\\n")

if target_select_lf in content_lf:
    content_lf = content_lf.replace(target_select_lf, replacement)
    print("Direct string replacement successful!")
else:
    # Fallback to regex
    print("Direct match failed, attempting regex...")
    pattern = re.compile(
        r'\{\s*activeTab\s*===\s*\'agenda\'\s*&&\s*\(\s*'
        r'<div\s+className="relative">\s*'
        r'<select\s+value=\{data\.teacher_id\}[^>]*>.*?'
        r'<\/select>\s*'
        r'<\/div>\s*\)\s*\}', 
        re.DOTALL
    )
    content_lf, count = pattern.subn(replacement, content_lf)
    print(f"Regex replacement replaced {count} matches.")

# Convert back to CRLF if the original file had it
if "\\r\\n" in content:
    content_final = content_lf.replace("\\n", "\\r\\n")
else:
    content_final = content_lf

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content_final)

print("Finished replacement!")
