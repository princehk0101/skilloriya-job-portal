const fs = require('fs');
const path = require('path');

const directories = [
  'd:/Sheriyans-Frontend/skilloriya/frontend/src/pages',
  'd:/Sheriyans-Frontend/skilloriya/frontend/src/components'
];

const replacements = [
  ["'Employer account se apply nahi kar sakte.'", "'Cannot apply using an employer account.'"],
  ["'Apply page load nahi ho pa raha.'", "'Unable to load the application page.'"],
  ["'Apply failed. Resume PDF aur required details check karo.'", "'Application failed. Please verify your Resume PDF and required details.'"],
  ["Abhi tak category records ya categorized jobs nahi hain. Employer se job post karte waqt category assign karni hogi.", "No categories or categorized jobs available yet. Employers must assign categories during job posting."],
  ["Backend me saved categories nahi mili, isliye jobs se derived category view dikhaya ja raha hai.", "Displaying derived categories as no saved overarching categories were found."],
  ["'Dashboard data load nahi ho pa raha. Backend endpoints check karo.'", "'Unable to load dashboard data. Please verify backend endpoints.'"],
  ["'Employer dashboard load nahi ho pa raha. Backend auth/endpoints check karo.'", "'Unable to load employer dashboard. Please verify backend connection.'"],
  ["'Job post nahi ho paaya. Required fields verify karo.'", "'Unable to post job. Please verify required fields.'"],
  ["'Company save nahi ho paaya. Required fields check karo.'", "'Unable to save company details. Please check required fields.'"],
  [">Logo, description, and company public details yahin se manage karo.<", ">Manage your logo, description, and public company details from here.<"],
  ["'OTP send nahi ho paya. Email dobara check karo.'", "'Failed to send OTP. Please check your email address.'"],
  ["\"Reset flow start karo bina extra friction ke.\"", "\"Start the reset flow without extra friction.\""],
  ["\"Email verify karke OTP step par move karo. Existing backend forgot-password API use ho rahi hai.\"", "\"Verify your email to proceed to the OTP step.\""],
  ["'OTP send nahi ho paaya. Email dobara check karo.'", "'Failed to send OTP. Please verify your email.'"],
  ["\"Agar password yaad nahi hai ya quick access chahiye, verified email par OTP bhej kar direct sign-in flow use kar sakte ho.\"", "\"If you cannot remember your password, request an OTP to your verified email for quick access.\""],
  ["Jo page aap dhoond rahe ho wo abhi available nahi hai ya route change ho gaya hai. Chalo home ya active portal pages par wapas chalte hain.", "The page you are looking for is currently unavailable or has been moved. Let's return to the active portal."],
  ["'Post job page load nahi ho pa raha. Backend auth ya category API check karo.'", "'Unable to load the post job page. Please check your connection.'"],
  ["'Job post nahi ho paaya. Required fields verify karo.'", "'Failed to post job. Please verify all required fields.'"],
  ["Abhi category records available nahi hain. Job uncategorized save hoga.", "Category records are currently unavailable. The job will be saved as uncategorized."],
  ["\"Profile load nahi ho pa raha. Login/session check karo.\"", "\"Unable to load profile. Please check your login session.\""],
  ["\"Profile update nahi ho paaya. Field values and image size check karo.\"", "\"Unable to update profile. Please verify field values and image sizes.\""],
  ["'Backend API se connection nahi ho raha. Django server ko run karo.'", "'Unable to connect to the backend API. Please ensure the server is running.'"],
  ["'Signup failed. Input dobara check karo.'", "'Signup failed. Please verify your inputs.'"],
  ["'Google signup complete nahi hua. Backend response check karo.'", "'Google signup incomplete. Please check backend response.'"],
  ["'Google login initiate nahi hua. Dobara try karo.'", "'Failed to initiate Google login. Please try again.'"],
  ["'OTP verify nahi ho paaya. Dobara try karo.'", "'Failed to verify OTP. Please try again.'"],
  ["'Email route state missing hai. Login OTP request flow dubara start karo.'", "'Email routing state is missing. Please restart the login OTP request flow.'"],
  ["'Signup email missing hai. Back jaake signup flow dobara run karo.'", "'Signup email is missing. Please return and restart the signup flow.'"],
  ["'Login failed. Credentials dobara check karo.'", "'Login failed. Please verify your credentials.'"],
  ["'Google login abhi complete nahi hua. Backend response check karo.'", "'Google login incomplete. Please check backend response.'"],
  ["'Company details load nahi ho pa rahe.'", "'Unable to load company details.'"],
  ["Is category me abhi jobs nahi hain.", "There are currently no jobs available in this category."],
  ["Categories abhi load nahi hui. Backend categories migrate hone ke baad yahan data dikhne lagega.", "Categories are not loaded yet. Data will appear once the backend is fully synced."],
  ["Categories abhi load nahi hui.", "Categories are currently loading."]
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      replacements.forEach(([search, replace]) => {
        while (content.includes(search)) {
          content = content.replace(search, replace);
          changed = true;
        }
      });
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

directories.forEach(processDirectory);
console.log('Text sanitization complete.');
