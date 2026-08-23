import { useNavigate } from 'react-router-dom';
import AddTrackerComponent from '../components/AddTracker';

export default function AddTrackerPage() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="container">
        <AddTrackerComponent
          onTrackerAdded={() => {
            navigate('/dashboard');
          }}
          onCancel={() => {
            navigate('/dashboard');
          }}
        />
      </div>
    </div>
  );
}
