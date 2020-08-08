import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import { motion, useTransform, AnimatePresence } from "framer-motion";
import SpotifyWebApi from "spotify-web-api-js";
import arrow from './arrow.png';
import circle from './circle.png';
const spotifyApi = new SpotifyWebApi();

class App extends Component {

  constructor(){
    super();
    const params = this.getHashParams();
    console.log(params);

    const token = params.access_token;
    if (token) {
       spotifyApi.setAccessToken(token);
    }

    this.state = {
     token: params.access_token,
     loggedIn: token ? true : false,
     type: '',
     term: '',
     top: [],
    }
    this.createPlaylist = this.createPlaylist.bind(this)

  }

  /* doesn't work lol */
  createPlaylist() {
    let term;
    if (this.state.term === 'short_term') {
      term = 'Past Month'
    } else if (this.state.term === 'medium_term') {
      term = 'Past 6 Months'
    } else {
      term = 'All Time'
    }
    const uris = this.state.top.map(track => {
      return track[0].uri
    })

    spotifyApi.createPlaylist({name: "Your Top Tracks – " + term});
    const playlist = spotifyApi.getUserPlaylists().then(response => {
      return [response.items[0].id, response.items[0].external_urls.spotify]
    }).catch(
      console.log('error')
    )

    spotifyApi.addTracksToPlaylist(playlist[0], uris)
    window.open(playlist[1], '_blank')
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  getTopArtists() {
    spotifyApi.getMyTopArtists()
      .then(response => { this.setState({
        topArtists: response.items.map(item => {
          return item.name;
          console.log(item.name)
        })
      })})
  }

  getTop(type, term) {
    fetch('https://api.spotify.com/v1/me/top/' + type + "?time_range=" + term + '&limit=9',
      {headers: {'Authorization': 'Bearer ' + this.state.token}})
    .then(response => response.json())
    .then(data => {
      if (this.state.type==='artists') {
          this.setState({top: data.items.map((item, index) =>
          [{name: item.name, url: item.external_urls.spotify, image: item.images[0].url, genre: item.genres[0]}]
        )})
        console.log(this.state.top)
      } else {
        this.setState({top: data.items.map((item, index) =>
          [{name: item.name, artist: item.artists[0].name, album: item.album.name, image: item.album.images[0].url, url: item.external_urls.spotify, uri: item.uri}]
        )})
        console.log(this.state.top)
      }
      console.log(data)
    })
  }

  render() {

    return (
      <motion.div className="app"
        animate={{
          background: [
            'linear-gradient(140deg, rgba(255,227,227,1) 0%, rgba(245,224,255,1) 50%, rgba(211,221,255,1) 100%)',
            'linear-gradient(100deg, rgba(255,227,227,1) 0%, rgba(245,224,255,1) 30%, rgba(211,221,255,1) 80%)',
            'linear-gradient(80deg, rgba(245,224,255,1) 20%, rgba(211,221,255,1) 60%, rgba(255,227,227,1) 80%)',
            'linear-gradient(110deg, rgba(211,221,255,1) 20%, rgba(255,227,227,1) 60%, rgba(245,224,255,1) 80%)'
          ]
        }}
        transition={{ duration: 4, flip: Infinity }}
      >

        <div className='nav'>
          <div className='text-flex'>
            <h3>See what you love jamming to on Spotify</h3>
          </div>
          <div className='text-flex'>
            <a href=""><h3>About</h3></a>
          </div>
        </div>

        <div className='body'>

          { !this.state.loggedIn &&
            <motion.h1
              animate={{ opacity: [0, 1], y: [-100, 150]}}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              First, let's <span>
              <motion.a href={
                 window.location = window.location.href.includes('localhost')
                 ? 'http://localhost:8888/'
                 : 'https://jammin-to-server.herokuapp.com/login'}
                 className='sign-in'>sign in</motion.a>
              </span> to Spotify.
            </motion.h1>
          }

          { this.state.loggedIn && this.state.type==='' &&
            <div className='body'>
              <motion.h3
                animate={{ opacity: [0, 1], y: [-300, 0]}}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                Prompt 1 of 2
              </motion.h3>
              <motion.h1
                animate={{ opacity: [0, 1], y: [-300, -20]}}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Do you want to view your top artists or top tracks?
              </motion.h1>
              <motion.div className='button-wrapper'
                animate={{ opacity: [0, 1], y: [80, 0]}}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              >
                <div className='button' onClick={() => this.setState({type: 'artists'})}>
                  <h3>Artists</h3>
                </div>
                <div className='button' onClick={() => this.setState({type: 'tracks'})}>
                  <h3>Tracks</h3>
                </div>
              </motion.div>
            </div>
          }

          { this.state.loggedIn && this.state.type!=='' && this.state.term==='' &&
            <div className='body'>
              <motion.h3
                animate={{ opacity: [0, 1], y: [-300, 0]}}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                Prompt 2 of 2
              </motion.h3>
              <motion.h1
                animate={{ opacity: [0, 1], y: [-300, -20]}}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                From the past month, 6 months, or of all time?
              </motion.h1>
              <motion.div className='button-wrapper'
                animate={{ opacity: [0, 1], y: [80, 0]}}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              >
                <div className='button' onClick={() => {
                  this.setState({term: 'short_term'});
                  this.getTop(this.state.type, 'short_term');
                }}>
                  <h3>Month</h3>
                </div>
                <div className='button' onClick={() => {
                  this.setState({term: 'medium_term'});
                  this.getTop(this.state.type, 'medium_term');
                }}>
                  <h3>6 months</h3>
                </div>
                <div className='button' onClick={() => {
                  this.setState({term: 'long_term'});
                  this.getTop(this.state.type, 'long_term');
                }}>
                  <h3>Of all time</h3>
                </div>
              </motion.div>
            </div>
          }

          { this.state.loggedIn && this.state.term!=='' &&
            <div>
              <motion.h3
                initial={{y: 100}}
                animate={{ opacity: [0, 1, 0]}}
                transition={{ duration: 1.7, delay: 0.2, ease: "easeInOut" }}
              >
                Beep boop beep boop
              </motion.h3>
              <motion.h1
                initial={{y: 100}}
                animate={{opacity: [0, 1, 0]}}
                transition={{ duration: 1.8, delay: 0.2, ease: "easeInOut" }}
              >
                Intense calculation in process...
              </motion.h1>

              <motion.h1
              animate={{ opacity: [0, 1], y: [-400, -170]}}
              transition={{ duration: 0.8, delay: 2, ease: "easeOut" }}
              >
                The results are in.
              </motion.h1>
              <motion.div className='results-wrapper'
                animate={{ opacity: [0, 1], y: -140}}
                transition={{ duration: 0.6, delay: 2, ease: "easeOut" }}
              >
                {this.state.type==='artists' && this.state.top.map((top, index) =>
                  <a className='result-width' href={top[0].url} target='_blank'><div className='result'>
                    <motion.p className='number'
                      animate={{ x: [40, 0]}}
                      transition={{ duration: 0.5, delay: 1.9, ease: "easeOut" }}
                    >{index+1}</motion.p>
                    <img className='result-img' src={top[0].image} />
                    <div className='result-info'>
                      <h2 className='result-title'>{top[0].name}</h2>
                      <h3 className='result-subtitle font-black'>{top[0].genre}</h3>
                    </div>
                  </div></a>
                )}
                {this.state.type==='tracks' && this.state.top.map((top, index) =>
                    <a className='result-width' href={top[0].url} target='_blank'><div className='result'>
                      <motion.p className='number'
                        animate={{ y: [30, 0]}}
                        transition={{ duration: 0.4, delay: 2, ease: "easeOut" }}
                      >{index+1}</motion.p>
                      <img className='result-img' src={top[0].image} />
                      <div className='result-info'>
                        <h2 className='result-title'>{top[0].name}</h2>
                        <h3 className='result-subtitle font-black'>{top[0].artist}</h3>
                        <h3 className='result-subtitle'>{top[0].album}</h3>
                      </div>
                    </div></a>
                )}
              </motion.div>

              {/*this.state.type==='tracks' && <motion.h3
                initial={{y:-190}}
                animate={{ opacity: [0, 1]}}
                transition={{ duration: 1.2, delay: 2.2, ease: "easeOut" }}
              >
                Click <span className='link' onClick={this.createPlaylist}>here</span> to create a playlist of your top tracks.
              </motion.h3>*/}
            </div>
          }

        </div>

      </motion.div>
    );

  };
};

export default App;
