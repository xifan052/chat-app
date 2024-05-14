import {
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from '@mui/material';

const ChatBox = ({ messageList }) => {
  // 对话的消息列表
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {messageList.map((message, index) => (
        <ListItem key={index} alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt={message.sender === 'user' ? 'User' : 'Bot'} src="1"/>
          </ListItemAvatar>
          <ListItemText
            sx={{
              typography: message.sender === 'user' ? 'body1' : 'subtitle1',
            }}
          >
            <Typography variant="caption" fontWeight="bold" fontSize="15px" sx={{ mt: 1 }}>{message.sender === 'user' ? 'You' : 'ChatGPT'}</Typography>
            <Typography variant="body1">{message.text || message.defaultText}</Typography>
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );
};

export default ChatBox;