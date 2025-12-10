import './page-styles/notFoundPage.css';
import { GoArrowUpRight } from "react-icons/go";
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className='not-found-page'>
      <div className='not-found-container'>
        <div className='not-found-content'>
          <p className='not-found-code'>404</p>
          <h1 className='not-found-title'>Page not found</h1>
          <p className='not-found-message'>
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
          <div className='not-found-actions'>
            <span className='not-found-button primary' onClick={() => navigate('/')}>
              <p>Back to Home</p>
              <GoArrowUpRight />
            </span>
            <span className='not-found-button secondary' onClick={() => navigate(-1)}>
              <p>Go Back</p>
            </span>
          </div>
        </div>
        
      </div>
    </div>
  )
}