# VR Swarm 🐋
This application uses [VueJS](https://vuejs.org) and [A-Frame](https://aframe.io) to declaratively render Docker Swarm in VR on a web page:  
![vr swarm screenshot](screenshot.png)

# quickstart
```bash
# you need a 1.13+/17.03+ swarm:
docker swarm init
# from the repo root:
docker deploy -c proxy-stack.yml proxy
docker deploy -c vr-swarm-stack.yml vr-swarm
# the app is now hosted on localhost at port 80
# the default config is to mount the src code into the frontend and hot-reload
```

# design
The application application runs as a docker stack on swarm mode with the following services:
## frontend
A web server responsible for serving a static bundle(`app.js`) of our VueJS application.  
The Vue app loads a component that long-polls docker API objects and presents them as DOM nodes in an Aframe scene.  

Currently, the only stack for this service is a NodeJS/Webpack server that builds the app on boot.  
Hot-Module-Reloads are enabled and the real-time VR dev experience is awesome.  
A production stack should be distributed in the future.  
## docker-api
We mount `ehazlett/docker-proxy` to a swarm-manager's socket and expose it to the frontend.  
This allows the frontend to consume the [Engine REST API](https://docs.docker.com/engine/api/get-started/).
## proxy
The frontend and backend should be served using HTTP path rules on the same origin.  
We use [traefik](https://traefik.io) as an unrelated cluster service to `PathPrefixStrip` `/docker` to the docker-api service.  
All other requests serve frontend assets.  


# hacking
At this point, the app is so simple that you only need to edit a single Vue Component: [src/components/Scene.vue](https://github.com/stealthybox/vr-swarm/blob/master/src/components/Scene.vue).  
It's fairly easy to modify.  
If you want to add new dependencies, the `Dockerfile` builds the frontend dev service.  

We'd love to hear your ideas!  
If you're a pro VR/A-Frame gamedev/hacker person and develop on a unique headset, we can learn from you.  


# acknowledgements
He made sure the door was locked, and confirmed the building security to the maximum level.
The electroturrets in the hallway started charging, their biocondensers humming and buzzing
like a hornet's nest. Even a pizza delivery drone with commercial delivery clearance would
be fried without notice now. He couldn't take any risk. He lowered the dark visored helmet
on his tired eyes. Both hololasers came to life, tracking his retinas to flood them with
bright colored beams painting billions of pixels per second. His vision blurred for a split
second before the virtual lock appeared in front of him. A swirl of letters, numbers, and
pictograms started to dance in front of him, like in a bad mescaline trip. He glazed over the
ten symbols that made up his access code. The lock made a satisfying "click." He cleared
his throat. "Igor, execute script Vee Ess Double-U Fifty Seven." He winced at the "confirm"
picticon. A big, dark rectangle materialized in front of him. Console output. Debugging
logs scrolled in front of him; he ignored it. The last line filled slowly with trailing dots.

AUTHENTICATING TO SOCKET...............SUCCESS!!!

The dark rectangle shrinked to the edge of his vision. If he were to need it again, he could
summon it just by a glance. But right now, the Swarm was unfolding in front of him; millions
of cubes stacked in improbable configurations; encased in huge transparent glass monoliths.
It looked like thousands of multi-dimensional Tetris games floating in front of him;
constellations of geometric shapes; no logic ordering visible to the untrained eye.
Each second, the API fed his program with thousands of events, millions of data points,
that were analyzed, tagged, grouped, derived, and mapped to his VR set. He could now see
fine colored mists oozing between the monoliths, representing network flows between the
virtual machines of the Swarm. He took a deep breath and started to focus on a group of
monoliths at the perimeter. He recognized the shape of these. Cheap spot compute. Negotiated
on the gray market. Great for throwaway experiments, but never schedule anything stateful
on them, or let them see PII or payment data. But these ... bright green angel hair, with
an almost symetric purple tuft at a 60 degreees angle. SSL termination. Amateurs. A wide
grin stretched his face.

All he had to do was to find on which gray market these compute instances were located,
place a slightly higher bid, make sure that his own compute job would get scheduled on
one of these hypervisors. Then he would leak out the SSL keys, and run a rogue service
on the edge of the Swarm, in the low security tagged nodes. He would have to watch
carefully for the regular rainbow-colored scans of the IDS, but he should be able to
run a honeypot and phish some access tokens. He sipped some Makete, winced at the metallic
taste. It would be a long night, and it was only beginning.

# contact
Please reach out via...  

Twitter:
- [Leigh ( capileigh )](https://twitter.com/capileigh)
- [Cody ( CodeMeister_P )](https://twitter.com/CodeMeister_P)

Slack:
- [Leigh ( docker-community / @stealthybox )](https://dockercommunity.slack.com/messages/@stealthybox)
