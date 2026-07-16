const fs = require('fs');
const path = require('path');

const files = [
  "src/components/AdmissionModal.tsx",
  "src/app/api/admissions/route.ts",
  "src/app/(auth)/counsellor-dashboard/page.tsx",
  "src/app/(auth)/admin-dashboard/addmission/page.tsx",
  "src/app/(auth)/admin-dashboard/brand-managers/page.tsx",
  "src/components/CourseDisplay.tsx"
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Normalize newlines to \n
  let normalizedContent = content.replace(/\r\n/g, '\n');
  
  // Regex to match git conflict markers
  const conflictRegex = /<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> (.*?)\n/g;
  
  let matchCount = 0;
  normalizedContent = normalizedContent.replace(conflictRegex, (match, headContent, theirsContent, theirsBranch) => {
    matchCount++;
    return theirsContent;
  });
  
  if (matchCount > 0) {
    // Write back with local line endings (if necessary, but node handles it often, or we can just write \n)
    fs.writeFileSync(filePath, normalizedContent, 'utf8');
    console.log(`Resolved ${matchCount} conflicts in ${file}`);
  } else {
    console.log(`No conflicts found in ${file}`);
  }
});
