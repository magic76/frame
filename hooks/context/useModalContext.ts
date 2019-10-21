import { useContext } from 'react';
import { ModalContext } from '~/components/context/ModalContext';

const useModalContext = () => {
	return useContext(ModalContext);
};

export default useModalContext;
