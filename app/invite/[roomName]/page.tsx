'use client';
import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import {
	setMinutes,
	setToken,
	setUsername,
	getUsername,
} from '@/app/utils/LocalStorage';
import Button from '@/app/components/Button';
import toast, { Toaster } from 'react-hot-toast';
import serverURL from '@/app/utils/ServerURI';

const InvitePage = ({ params }: { params: { roomName: string } }) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [username, setusername] = useState('');
	const [validInvite, setValidInvite] = useState<boolean | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		console.log('CHecking ---- ');

		const checkInviteExpiration = async () => {
			const inviteToken = searchParams.get('token') as string;
			try {
				const checkInviteCall = await fetch(`${serverURL}/invite`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${inviteToken}`,
					},
				});
				const result = await checkInviteCall.json();
				if (result) {
					console.log('validity of token : ',result.validity);
					!result.validity && toast.error('Invite link expired!') 
					setValidInvite(result.validity);
				}
			} catch (error) {
				console.log('Error in checking invite expiration ', error);
			}
		};

		const username = getUsername();
		if (username) router.push(`/rooms/${params.roomName}`);
		else checkInviteExpiration();
	}, []);

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (username.length < 3) {
			setError('Username must be atleast 3 characters');
			return;
		}
		if (validInvite) {
			const newSocket = io('http://localhost:5000');

			newSocket.on('connect', () => {
				console.log('Connected to server');
			});

			const minutes = searchParams.get('minutes') as string;
			newSocket.emit('generate-token', {
				username: username,
				minutes: minutes,
			});
			setMinutes(minutes);

			newSocket.on('token-generated', (token) => {
				setToken(token);
				setUsername(username);
				router.push(`/rooms/${params.roomName}`);
			});

			return () => {
				newSocket.disconnect();
			};
		}
	};

	return (
		<div className=' flex flex-col justify-center items-center md:w-11/12 md:h-11/12 w-full h-full space-y-6'>
			<h3 className='text-slate-200 md:text-4xl text-3xl font-extrabold mb-12'>
				Meeting Invite
			</h3>
			<form onSubmit={onSubmit} className=' flex flex-col justify-center items-center'>
				<input
					type='text'
					placeholder='Enter your name'
					value={username}
					className='text-black py-2 px-2 mb-6 md:text-md rounded focus:ring-2 focus:ring-green-1 focus:outline-none w-80 md:w-96'
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setusername(e.target.value)
					}
				/>
				<Button buttonText='Join Room' type='submit'/>
				<p className='text-red-500 h-3'>{error}</p>
			</form>
			<Toaster/>
		</div>
	);
};

export default InvitePage;
