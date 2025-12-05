import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import makeBlockie from 'ethereum-blockies-base64';

const WalletConnect = ({ onWalletConnected }) => {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [ensAvatar, setEnsAvatar] = useState(null);
  const [error, setError] = useState(null);
  const web3Modal = useRef(null);
  const providerRef = useRef(null);

  useEffect(() => {
    if (!web3Modal.current) {
      web3Modal.current = new Web3Modal({
        cacheProvider: false,
        providerOptions: {},
        theme: 'dark',
      });
    }
    if (web3Modal.current.cachedProvider) {
      connectWallet();
    }
    // eslint-disable-next-line
  }, []);

  const fetchENS = async (address, provider) => {
    try {
      const ens = await provider.lookupAddress(address);
      setEnsName(ens);
      if (ens) {
        const avatar = await provider.getAvatar(ens);
        setEnsAvatar(avatar);
      } else {
        setEnsAvatar(null);
      }
    } catch {
      setEnsName(null);
      setEnsAvatar(null);
    }
  };

  const connectWallet = async () => {
    setError(null);
    try {
      const instance = await web3Modal.current.connect();
      const ethersProvider = new ethers.providers.Web3Provider(instance);
      providerRef.current = ethersProvider;
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setIsConnected(true);
      await fetchENS(address, ethersProvider);
      if (onWalletConnected) {
        const network = await ethersProvider.getNetwork();
        onWalletConnected(address, network.chainId, ethersProvider);
      }
      instance.on && instance.on('disconnect', disconnectWallet);
    } catch (err) {
      setError(err.message || 'Conexión cancelada. Intenta de nuevo si deseas conectar tu wallet.');
    }
  };

  const disconnectWallet = async () => {
    setIsConnected(false);
    setAccount(null);
    setEnsName(null);
    setEnsAvatar(null);
    setError(null);
    if (web3Modal.current) {
      await web3Modal.current.clearCachedProvider();
    }
    providerRef.current = null;
  };

  // Avatar a mostrar: ENS avatar, o blockie
  const avatarUrl = ensAvatar || (account ? makeBlockie(account) : null);
  // Nombre a mostrar: ENS name o dirección abreviada
  const displayName = ensName || (account ? account.slice(0, 6) + '...' + account.slice(-4) : '');

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-ultraviolet/20">
      <h3 className="text-lg font-bold text-white mb-4">
        {t('wallet.voting_panel')}
      </h3>
      {!isConnected ? (
        <div className="text-center">
          <button
            onClick={connectWallet}
            className="bg-ultraviolet text-white px-6 py-3 rounded-lg font-semibold hover:bg-ultraviolet-dark transition-colors"
          >
            {t('wallet.connect_wallet')}
          </button>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          <p className="text-gray-400 text-sm mt-2">
            {t('wallet.supported_wallets')}
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2">
            {avatarUrl && (
              <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-ultraviolet/40 bg-background" />
            )}
            <span className="text-white font-bold">{displayName}</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            {t('wallet.disconnect')}
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 