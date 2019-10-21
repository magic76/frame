import React, { createContext, useState } from 'react';

type ModalContent = React.ReactElement | null | undefined;
type ModalSize = {
	width: string;
	height: string;
};

interface IModalState {
	isOpened: boolean;
	content: ModalContent;
	size: ModalSize;
}

interface IModalStore extends IModalState {
	activateModal: (content: ModalContent) => void;
	deactivateModal: () => void;
}

const initStore: IModalStore = {
	isOpened: false,
	content: null,
	size: {
		width: '',
		height: '',
	},
	activateModal: () => {
		console.error('[activateModal] did not connect to the context');
	},
	deactivateModal: () => {
		console.error('[deactivateModal] did not connect to the context');
	},
};

export const ModalContext = createContext(initStore);

interface IModalProviderProps {
	defaultOpened?: boolean;
	defaultSize?: ModalSize;
}

export const ModalProvider: React.FC<IModalProviderProps> = props => {
	const { defaultOpened = false, defaultSize = { width: '480px', height: '320px' }, children } = props;
	const [currentOpenedState, setOpenedState] = useState(defaultOpened);
	const [currentContent, setContent] = useState<ModalContent>(null);
	const [currentSize, setSize] = useState<ModalSize>(defaultSize);

	const activateModal = (content: ModalContent, size?: ModalSize) => {
		size && setSize(size);
		setContent(content);
		setOpenedState(true);
	};

	const deactivateModal = () => {
		setSize(defaultSize);
		setContent(null);
		setOpenedState(false);
	};

	const store: IModalStore = {
		isOpened: currentOpenedState,
		content: currentContent,
		size: currentSize,
		activateModal,
		deactivateModal,
	};
	return <ModalContext.Provider value={store}>{children}</ModalContext.Provider>;
};

export const ModalConsumer = ModalContext.Consumer;
