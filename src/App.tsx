import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import { Box } from '@react-three/drei';
import "./App.css"
import Markdown from "react-markdown";
import OpenAI from "openai";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const RotatingCube: React.FC = () => {
    const cubeRef = useRef<THREE.Mesh>(null);
    const [rotationSpeed] = useState(0.01);
    const [color, setColor] = useState<string>('pink');

    // Function to generate a random color
    const getRandomColor = (): string => {
        const letters = '0123456789ABCDEF';
        let newColor = '#';
        for (let i = 0; i < 6; i++) {
            newColor += letters[Math.floor(Math.random() * 16)];
        }
        return newColor;
    };

    useEffect(() => {
        // Change color every 5 seconds with a smooth transition
        const colorInterval = setInterval(() => {
            const newColor = getRandomColor();
            setColor(newColor);
        }, 5000);

        return () => {
            clearInterval(colorInterval);
        };
    }, []);

    useFrame(() => {
        if (cubeRef.current) {
            cubeRef.current.rotation.x += rotationSpeed;
            cubeRef.current.rotation.y += rotationSpeed;
        }
    });

    return (
        <Box ref={cubeRef} scale={[5, 5, 5]} position={[0, 0, -10]}>
            <meshStandardMaterial attach="material" color={color} />
        </Box>
    );
};

const App: React.FC = () => {
    const [content,setContent]=useState("")
    const apikeyRef=useRef<HTMLInputElement|null>(null);
    const questionRef=useRef<HTMLInputElement|null>(null);
    const [loading,setLoading]=useState(false);
    async function chat() {
        setLoading(true);
        try{
            let openai = new OpenAI({apiKey:String(apikeyRef.current?.value),dangerouslyAllowBrowser: true});
            const completion = await openai.chat.completions.create({
                messages: [{"role": "system", "content": "يتم الرد على الأسئلة باللغة العربية وبناء الجملة، ويتم عرضها بطريقة هرمية. وبناءً على الأسئلة، يتم تحليل الإجابات واحدة تلو الأخرى وإبراز المفاهيم التي يمكن توسيعها للتفكير."},{"role": "user", "content": String(questionRef.current?.value)},],
                model: "gpt-3.5-turbo",
            });
            setContent(String(completion.choices[0]["message"]["content"]));
        } catch (e){
            toast.error(String(e));
        } finally {
            setLoading(false);
        }
    }
    return (
        <main>
            <ToastContainer />
            <h1 className={"Title-Text"}> الأستاذة هيام</h1>
            <div className={"block"}>
                <input ref={apikeyRef} type={"text"} placeholder={"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"} style={{width:"10%"}}/>
            </div>
            <h2>Chat Now</h2>
            <div className={"block"}>
                <div style={{width:"20%"}}>
                    <Canvas camera={{ position: [0, 0, 5] }}>
                        <ambientLight />
                        <pointLight position={[10, 10, 10]} />
                        <RotatingCube />
                    </Canvas>
                </div>
                <div className={"chat-block"} style={{flex:1}}>
                    <div style={{display:"flex",flexDirection:"row",justifyContent:"space-evenly"}}>
                        <input ref={questionRef} type={"text"} placeholder={"سؤالك"}/>
                        {loading?<div className="loading-spinner"></div>:<button className={"ChatButton"} onClick={chat}>أسال</button>}
                    </div>
                    <Markdown>{content}</Markdown>
                </div>
            </div>
        </main>
    );
};

export default App;
