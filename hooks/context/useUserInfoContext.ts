import { useContext } from 'react';
import { UserInfoContext } from '~/components/context/UserInfoContext';

const useUserInfoContext = () => {
	return useContext(UserInfoContext);
};

export default useUserInfoContext;

