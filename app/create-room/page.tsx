import React from 'react';
import CreateRoom from '../components/CreateRoom';
import Header from '../components/Header';

const page = () => {
	return (
		<div className='flex flex-col justify-between items-center w-screen h-screen space-y-6'>
			<Header />
			<h3 className='text-slate-200 md:text-4xl text-3xl font-extrabold my-12'>
				Create Instant Room
			</h3>
			<CreateRoom />
		</div>
	);
};

export default page;