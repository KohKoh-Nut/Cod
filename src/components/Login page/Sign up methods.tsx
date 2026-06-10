import { FaGoogle, FaGithub, FaApple, FaDiscord } from 'react-icons/fa';

{/* The Visual Divider Line */}
<div className="relative flex py-5 items-center">
  <div className="flex-grow border-t border-slate-600"></div>
  <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wider">Or continue with</span>
  <div className="flex-grow border-t border-slate-600"></div>
</div>

{/* 4-Column Social Login Grid */}
<div className="grid grid-cols-4 gap-3">
  
  {/* Google */}
  <button 
    type="button" 
    onClick={() => handleSocialLogin('Google')}
    className="flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded font-medium transition-colors border border-slate-600"
    title="Sign up with Google"
  >
    {/* Google Icon */}
    <FaGoogle size={20} />
  </button>

  {/* GitHub */}
  <button 
    type="button" 
    onClick={() => handleSocialLogin('GitHub')}
    className="flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded font-medium transition-colors border border-slate-600"
    title="Sign up with GitHub"
  >
    {/* GitHub Icon */}
    <FaGithub size={20} />
  </button>

  {/* Apple */}
  <button 
    type="button" 
    onClick={() => handleSocialLogin('Apple')}
    className="flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded font-medium transition-colors border border-slate-600"
    title="Sign up with Apple"
  >
    {/* Apple Icon */}
    <FaApple size={20} />
  </button>

  {/* Discord */}
  <button 
    type="button" 
    onClick={() => handleSocialLogin('Discord')}
    className="flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded font-medium transition-colors border border-slate-600"
    title="Sign up with Discord"
  >
    {/* Discord Icon */}
    <FaDiscord size={20} />
  </button>

</div>