import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import './App.css';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowUpwardSharpIcon from '@mui/icons-material/ArrowUpwardSharp';
import ChatMessage from './components/ChatMessage';

function App() {

  const [messageList, setMessageList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [apiKey, setApiKey] = useState('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');
  const [showSettingModal, setShowSettingModal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
    }
  }, [messageList]);

  const formatDataStr = (data) => {
    const replaceStr = (str) => {
      const lastIndex = str.indexOf(": OPENROUTER PROCESSING")
      let dataStr = lastIndex === -1 ? str : str.substr(0, lastIndex) // 截取字符来过滤字符串后面的: OPENROUTER PROCESSING，
      const arr = dataStr?.split("data: ") || [] // 通过截取data: ，把字符串分割为数组
      try {
        // 过滤无效数据，并转为json数组
        return arr.filter(item => item.length && !item.includes("[DONE]")).map(item => JSON.parse(item))
      } catch (error) {
        console.error("error", error, arr)
        return []
      }
    }
    // 过滤字符串开头的 : OPENROUTER PROCESSING
    if (!data.startsWith(": OPENROUTER PROCESSING")) {
      return replaceStr(data)
    }
    return []
  }

  const sendMessage = async () => {
    if (inputValue === '') {
      return
    }
    if (!apiKey) return alert("Please set apikey in the bottom left corner.");

    try {
      setMessageList(prevMessage => [...prevMessage, { text: inputValue, sender: 'user' }, { text: '', defaultText: 'Getting results ...', sender: 'ai' }]);
      setInputValue("")
      // https://openrouter.ai/playground?models=mistralai/mistral-7b-instruct:free
      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "mistralai/mistral-7b-instruct:free",
          "messages": [
            { "role": "user", "content": inputValue },
          ],
          "stream": true
        })
      }).then(async res => {
        const reader = res.body.getReader();
        // 逐步读取数据块
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const data = new TextDecoder().decode(value);
          const messageData = formatDataStr(data) // 格式返回的字符串输出json
          if (messageData.length && messageData[0].error) {
            // 处理接口报错
            setMessageList((prevMessages) => {
              prevMessages[prevMessages.length - 1].text = `An error has occurred，${messageData[0]?.error.message}`
              return [...prevMessages];
            });
            return
          }
          messageData.forEach(item => {
            // 拼接回传消息
            setMessageList((prevMessages) => {
              prevMessages[prevMessages.length - 1].text += item?.choices[0].delta.content
              return [...prevMessages];
            });

          });
        }
      });
    } catch (error) {
      console.error("Error:", error);
      setMessageList([...messageList, { text: "There was an error. Please try again.", sender: 'ai' }]);
    }
  };

  const openSettingModal = () => {
    setShowSettingModal(true)
  }

  const closeSettingModal = () => {
    setShowSettingModal(false)
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', }} ref={messagesEndRef}>
        {messageList.length ? <ChatMessage messageList={messageList}></ChatMessage> :
          <div className='empty-text'>
            Please start asking questions in English
          </div>
        }
      </Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SettingsIcon sx={{ cursor: 'pointer' }} onClick={openSettingModal}></SettingsIcon>
        <TextField
          fullWidth
          label="Message ChatGPT"
          variant="outlined"
          sx={{
            marginLeft: 2,
            '& .MuiOutlinedInput-root  fieldset': {
              borderRadius: "20px", // 确保外框也具有相同的圆角
            },
          }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <ArrowUpwardSharpIcon onClick={sendMessage} className='send-btn' disabled={inputValue === ''}></ArrowUpwardSharpIcon>
              </InputAdornment>
            ),
          }}
        />

      </Box>
      <Dialog
        open={showSettingModal}
        onClose={closeSettingModal}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            closeSettingModal();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            setApiKey(formJson.apiKey)
          },
        }}
      >
        <DialogTitle>Setting</DialogTitle>
        <DialogContent
          sx={{ width: 500 }}
        >
          <TextField
            autoFocus
            required
            margin="dense"
            name="apiKey"
            label="API KEY"
            fullWidth
            variant="standard"
            defaultValue={apiKey}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSettingModal}>cancel</Button>
          <Button type="submit">confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );


}

export default App;