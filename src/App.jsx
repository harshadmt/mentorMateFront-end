import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Components/LandingPage/Home";
import Signup from "./Components/Pages/Log-Sign/Signup";
import LoginPage from "./Components/Pages/Log-Sign/Login";
import StudentDashboard from "./Components/Pages/studentsection/dashboard";
import ProtectedRoute from "./ProtectedRoute";
import MentorDashboard from './Components/Pages/mentor-section/Mentordash';
import SeeRoadmaps from './Components/Pages/mentor-section/Roadmap/roadmap';
import ViewRoadmap from './Components/Pages/mentor-section/Roadmap/Viewroad';
import CreateRoadmap from './Components/Pages/mentor-section/Roadmap/createroadmap';
import AdminDashboard from './Components/Pages/Admin-section/Admin-Dash/Admin-dash';
import EditRoadmap from './Components/Pages/mentor-section/Roadmap/Roadmapedit';
import MyStudents from './Components/Pages/mentor-section/myStudent';
import ChatWithStudent from './Components/Pages/mentor-section/Chatwithstudent';
import EditProfile from './Components/Pages/mentor-section/editprofile';
import useUserStore from "../zustore/store"
import NotFound from "./pageNotFound";
import RoadmapSystem from "./Components/Pages/studentsection/getRoadmao/Roadmap";
import EditstudentProfile from "./Components/Pages/studentsection/EditProfile/EditStudentProfile";
import PurchasedRoadmap from "./Components/Pages/studentsection/UnlockedRoadMap/UnlockMap";
import RazorpayPaymentWrapper from "./Components/Pages/studentsection/UnlockedRoadMap/paymentWrapper";
import Mentors from "./Components/Pages/studentsection/Mentors/mentor";
import MentorProfile from "./Components/Pages/studentsection/ViewmentorProfile/Viewmwntor";
import ViewStudentProfile from "./Components/Pages/mentor-section/Roadmap/viewStudent";
import ChatWithMentor from "./Components/Pages/studentsection/Chat/Chat";
import ScheduleSession from "./Components/Pages/mentor-section/VideoSession/sessionSchedule";
import MySessions from "./Components/Pages/mentor-section/VideoSession/mySession";
import EditSessionPage from "./Components/Pages/mentor-section/VideoSession/EditSession";
import MySession from "./Components/Pages/studentsection/MySession/Mysession";
import VideoCallPage from "./Components/Pages/mentor-section/VideoSession/videoPage";
import StudentNotifications from "./Components/Pages/studentsection/Notifications/Notification";
import MentorNotifications from "./Components/Pages/mentor-section/Notification";
import AdminUsers from "./Components/Pages/Admin-section/getUser/ManageUser";
import AdminRoadmaps from "./Components/Pages/Admin-section/getRoadmap/Roadmap";
import AllTransactions from "./Components/Pages/Admin-section/transactions/Transaction";
import AdminSettingsPage from "./Components/Pages/Admin-section/AdminSetting/adminSetting";



function App() {
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser(); 
  }, []);

  // Remove stray `jsx` attributes left by some tools to avoid React non-boolean attribute warnings
  useEffect(() => {
      try {
      const els = document.querySelectorAll('[jsx]');
      els.forEach(el => el.removeAttribute('jsx'));
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element = {<NotFound/>}/>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/studentdashboard" element={<StudentDashboard />} />
          <Route path="/student/getroadmaps" element={<RoadmapSystem/>}/>
        <Route path="/student/unlockedRoadmap/:id" element={<PurchasedRoadmap />} />
         <Route path="/student/mentor" element={<Mentors/>}/>
       <Route path="/student/mentorprofile/:id" element={<MentorProfile/>}/>
           <Route path="/student/payment" element={<RazorpayPaymentWrapper />} /> 
           <Route path="/student/chat" element={<ChatWithMentor/>}/>
          <Route path="/student/editprofile" element={<EditstudentProfile/>}/>
          <Route path="/student/videopage/:id" element={<VideoCallPage/>}/>
          <Route path="/student/mySession" element={<MySession/>}/>
          <Route path="/student/notifications" element ={<StudentNotifications/>}/>
        </Route>
 
        <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
          <Route path="/mentor/mentordashboard" element={<MentorDashboard />} />
          <Route path='/mentor/roadmaps' element={<SeeRoadmaps />} />
          <Route path="/mentor/edit/:id" element={<EditRoadmap />} />
          <Route path="/mentor/viewroad/:id" element={<ViewRoadmap />} />
          <Route path="/mentor/students/:studentId" element={<ViewStudentProfile/>}/>
          <Route path='/mentor/createRoadmap' element={<CreateRoadmap />} />
          <Route path='/mentor/student' element={<MyStudents />} />
          <Route path='/mentor/chat' element={<ChatWithStudent />} />
          <Route path="/mentor/schedule-session" element={<ScheduleSession/>}/>
          <Route path="/mentor/mysession" element={<MySessions/>}/>
          <Route path="/mentor/editsession/:id" element={<EditSessionPage/>}/>
         <Route path="/mentor/videopage/:id" element={<VideoCallPage />} />
          <Route path='/mentor/notification' element={<MentorNotifications />} />
          <Route path='/mentor/editprofile' element={<EditProfile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/admindashboard" element={<AdminDashboard />}/>
          <Route path="/admin/adminUser" element ={<AdminUsers/>}/>
          <Route path="/admin/adminRoadmap" element={<AdminRoadmaps/>}/>
          <Route path="/admin/transaction" element={<AllTransactions/>}/>
           <Route path="/admin/setting" element ={<AdminSettingsPage/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
