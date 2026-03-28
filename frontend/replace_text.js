const fs = require('fs');
const path = require('path');

const directories = [
  'd:/Sheriyans-Frontend/skilloriya/frontend/src/pages',
  'd:/Sheriyans-Frontend/skilloriya/frontend/src/components'
];

const replacements = [
  { search: /'Employer account se apply nahi kar sakte.'/g, replace: "'Cannot apply using an employer account.'" },
  { search: /'Apply page load nahi ho pa raha.'/g, replace: "'Unable to load the application page.'" },
  { search: /'Apply failed. Resume PDF aur required details check karo.'/g, replace: "'Application failed. Please verify your Resume PDF and required details.'" },
  { search: /Abhi tak category records ya categorized jobs nahi hain. Employer se job post karte waqt category assign karni hogi./g, replace: "No categories or categorized jobs available yet. Employers must assign categories during job posting." },
  { search: /Backend me saved categories nahi mili, isliye jobs se derived category view dikhaya ja raha hai./g, replace: "Displaying derived categories as no saved overarching categories were found." },
  { search: /'Dashboard data load nahi ho pa raha. Backend endpoints check karo.'/g, replace: "'Unable to load dashboard data. Please verify backend endpoints.'" },
  { search: /'Employer dashboard load nahi ho pa raha. Backend auth\/endpoints check karo.'/g, replace: "'Unable to load employer dashboard. Please verify backend connection.'" },
  { search: /'Job post nahi ho paaya. Required fields verify karo.'/g, replace: "'Unable to post job. Please verify required fields.'" },
  { search: /'Company save nahi ho paaya. Required fields check karo.'/g, replace: "'Unable to save company details. Please check required fields.'" },
  { search: />Logo, description, and company public details yahin se manage karo.</g, replace: ">Manage your logo, description, and public company details from here.<" },
  { search: /'OTP send nahi ho paya. Email dobara check karo.'/g, replace: "'Failed to send OTP. Please check your email address.'" },
  { search: /"Reset flow start karo bina extra friction ke."/g, replace: "\"Start the reset flow without extra friction.\"" },
  { search: /"Email verify karke OTP step par move karo. Existing backend forgot-password API use ho rahi hai."/g, replace: "\"Verify your email to proceed to the OTP step.\"" },
  { search: /'OTP send nahi ho paaya. Email dobara check karo.'/g, replace: "'Failed to send OTP. Please verify your email.'" },
  { search: /"Agar password yaad nahi hai ya quick access chahiye, verified email par OTP bhej kar direct sign-in flow use kar sakte ho."/g, replace: "\"If you cannot remember your password, request an OTP to your verified email for quick access.\"" },
  { search: /Jo page aap dhoond rahe ho wo abhi available nahi hai ya route change ho gaya hai. Chalo home ya active portal pages par wapas chalte hain./g, replace: "The page you are looking for is currently unavailable or has been moved. Let's return to the active portal." },
  { search: /'Post job page load nahi ho pa raha. Backend auth ya category API check karo.'/g, replace: "'Unable to load the post job page. Please check your connection.'" },
  { search: /'Job post nahi ho paaya. Required fields verify karo.'/g, replace: "'Failed to post job. Please verify all required fields.'" },
  { search: /Abhi category records available nahi hain. Job uncategorized save hoga./g, replace: "Category records are currently unavailable. The job will be saved as uncategorized." },
  { search: /"Profile load nahi ho pa raha. Login\/session check karo."/g, replace: "\"Unable to load profile. Please check your login session.\"" },
  { search: /"Profile update nahi ho paaya. Field values and image size check karo."/g, replace: "\"Unable to update profile. Please verify field values and image sizes.\"" },
  { search: /'Backend API se connection nahi ho raha. Django server ko run karo.'/g, replace: "'Unable to connect to the backend API. Please ensure the server is running.'" },
  { search: /'Signup failed. Input dobara check karo.'/g, replace: "'Signup failed. Please verify your inputs.'" },
  { search: /'Google signup complete nahi hua. Backend response check karo.'/g, replace: "'Google signup incomplete. Please check backend response.'" },
  { search: /'Google login initiate nahi hua. Dobara try karo.'/g, replace: "'Failed to initiate Google login. Please try again.'" },
  { search: /'OTP verify nahi ho paaya. Dobara try karo.'/g, replace: "'Failed to verify OTP. Please try again.'" },
  { search: /'Email route state missing hai. Login OTP request flow dubara start karo.'/g, replace: "'Email routing state is missing. Please restart the login OTP request flow.'" },
  { search: /'Signup email missing hai. Back jaake signup flow dobara run karo.'/g, replace: "'Signup email is missing. Please return and restart the signup flow.'" },
  { search: /'Login failed. Credentials dobara check karo.'/g, replace: "'Login failed. Please verify your credentials.'" },
  { search: /'Google login abhi complete nahi hua. Backend response check karo.'/g, replace: "'Google login incomplete. Please check backend response.'" },
  { search: /'Company details load nahi ho pa rahe.'/g, replace: "'Unable to load company details.'" },
  { search: /Is category me abhi jobs nahi hain./g, replace: "There are currently no jobs available in this category." },
  { search: /Categories abhi load nahi hui./g, replace: "Categories are currently loading." },
  { search: /Categories abhi load nahi hui. Backend categories migrate hone ke baad yahan data dikhne lagega./g, replace: "Categories are not loaded yet. Data will appear once the backend is fully synced." }
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
      
      replacements.forEach(({ search, replace }) => {
        if (content.match(search)) {
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
