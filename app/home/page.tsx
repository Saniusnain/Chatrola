'use client';
import { IncomingMessage } from 'http';
import { useEffect, useState, ChangeEvent } from 'react';
import io, { Socket } from 'socket.io-client';

export default function Home() {
	const [socket, setSocket] = useState<Socket | null>();
	const [id, setId] = useState('');
	const [msgInput, setMsgInput] = useState("");
	const [message, setMessage] = useState<string []>([]);
	const [room, setRoom] = useState("");

	useEffect(() => {
		const newSocket = io('http://localhost:5000');

		newSocket.on('connect', () => {
			console.log('Connected to server');
		});

		newSocket.on('disconnect', () => {
			console.log('Disconnected from server ');
		});

		newSocket.on('UserID', (message) => {
			setId(message);
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	// Receiving message
	useEffect(() => {
        if (socket) {
            const handleMessage = (socketMessage: string) => {
                console.log("message array ", message, " socket ", socketMessage);
                setMessage(prevMessage => [...prevMessage, socketMessage]);
            };

            socket.on('emitMessage', handleMessage);

            return () => {
                socket.off('emitMessage', handleMessage);
            };
        }
    }, [socket, message]);

	// sending message
	// const sendMessage= () => {
	// 	// { to: id, message: msgInput }
	// 	socket?.emit('sendmessage', msgInput);
	// 	setMsgInput("");
	// }

	const sendMessage = () => {
        if (msgInput !== '' && room !== '' && socket) {
            socket.emit('sendmessage', { room, msg: msgInput });
            setMsgInput("");
        }
    };

	const joinRoom = () => {
        if (room !== '' && socket) {
            socket.emit('join room', room);
        }
    };


	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };
	
	return (
		<main>
			<div className="border-2 border-teal-300 mb-10">
				<input type="text" value={room} onChange={(e: ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)} className="text-black"/>
				<button
					className='bg-gray-500 p-2 m-2 hover:bg-gray-400'
					onClick={() => joinRoom()}
				>
					Connect Room
				</button>
			</div>

			<input type="text" value={msgInput} onKeyDown={handleKeyDown} onChange={(e: ChangeEvent<HTMLInputElement>) => setMsgInput(e.target.value)} className="text-black"/>
			<button
				className='bg-gray-500 p-2 m-2 hover:bg-gray-400'
				onClick={() => sendMessage()}
			>
				Send
			</button>
			{message.map((data, index) => {
				return <p key={index} className="text-xl text-white ">{data}</p>
			})}
		</main>
	);
}
