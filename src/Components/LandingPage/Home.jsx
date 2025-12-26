import React from 'react'
import Navbar from './Navbar'
import Landing from './Banner'
import FeaturesSection from './middlepage'
import Footer from './Footer'
import SuccessStories from './Success'

const Home = () => {
  return (
    <div>
      <Navbar/>
      <Landing/>
      <FeaturesSection/>
      <SuccessStories/>
      <Footer/>
    </div>
  )
}

export default Home
