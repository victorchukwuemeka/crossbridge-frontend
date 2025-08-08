import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'; // Add this import
import FeeCollectionComponent from './FeesCollectionComponent';

const AdminPanel = () => {
  const wallet = useWallet();

  return (
    <div className="p-4">
      <h1>Admin Dashboard</h1>
      <div className="mb-4">
        <WalletMultiButton /> {/* Add wallet connector button */}
      </div>
      
      {wallet.connected && <FeeCollectionComponent />}
    </div>
  );
};

export default AdminPanel;