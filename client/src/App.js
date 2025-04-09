import LobbyScreen from './screens/Lobby';
import './App.css';
import {Route,Routes} from 'react-router-dom'
import RoomScreen from './screens/Room';
function App() {
  return (
    <div className="App">
     <Routes>
      <Route path='/' element={<LobbyScreen/>}/>
      <Route path='/room/:roomId' element={<RoomScreen/>}/>

     </Routes>
    </div>
  );
}

export default App;