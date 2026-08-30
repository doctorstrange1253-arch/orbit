/**
 * WarpTransition.jsx — Cinematic route transition wrapper.
 *
 * Wraps <Routes> with framer-motion's AnimatePresence in `mode="wait"` so the
 * outgoing page fully exits before the new page enters. Each <Route element>
 * should be wrapped in <PageTransition> (see below) so motion can mount/unmount
 * the keyed child.
 *
 * The transition is a fast (350ms) scale + opacity + blur warp:
 *   enter:  { opacity: 0, scale: 0.985, filter: 'blur(6px)' }
 *   exit:   { opacity: 0, scale: 1.015, filter: 'blur(6px)' }
 *   center: { opacity: 1, scale: 1,    filter: 'blur(0px)' }
 *
 * Per the global design language, durations use the cubic-bezier(0.22, 1, 0.36, 1)
 * "expo-out" easing so the page settles smoothly rather than bouncing.
 *
 * Mounted once in App.jsx around <Routes>:
 *   <WarpTransition>
 *     <Routes location={location} key={location.pathname}>...</Routes>
 *   </WarpTransition>
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const variants = {
    initial: { opacity: 0, scale: 0.985, filter: 'blur(6px)' },
    enter:   { opacity: 1, scale: 1,     filter: 'blur(0px)' },
    exit:    { opacity: 0, scale: 1.015, filter: 'blur(6px)' },
};

const transition = {
    duration: 0.35,
    ease: [0.22, 1, 0.36, 1],
};

/**
 * PageTransition — drop-in wrapper for each <Route element>.
 * Animates enter/exit via the parent AnimatePresence; keying is done by
 * pathname at the parent.
 */
export const PageTransition = ({ children }) => (
    <motion.div
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={transition}
        style={{ willChange: 'opacity, transform, filter' }}
    >
        {children}
    </motion.div>
);

/**
 * WarpTransition — wraps a <Routes> tree. Re-renders Routes with a
 * pathname key so AnimatePresence can detect the route change and run
 * the enter/exit pair.
 */
const WarpTransition = ({ children }) => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait" initial={false}>
            <div key={location.pathname} style={{ minHeight: '100%' }}>
                {children}
            </div>
        </AnimatePresence>
    );
};

export default WarpTransition;
