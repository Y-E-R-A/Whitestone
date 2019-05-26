--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: activitylog; Type: TABLE; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

CREATE TABLE activitylog (
    logid integer NOT NULL,
    date character varying,
    "time" time without time zone,
    urole character varying(15),
    uemail character varying(50),
    logmessage character varying(100)
);


ALTER TABLE public.activitylog OWNER TO whitestoneadmin;

--
-- Name: activitylog_logid_seq; Type: SEQUENCE; Schema: public; Owner: whitestoneadmin
--

CREATE SEQUENCE activitylog_logid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activitylog_logid_seq OWNER TO whitestoneadmin;

--
-- Name: activitylog_logid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whitestoneadmin
--

ALTER SEQUENCE activitylog_logid_seq OWNED BY activitylog.logid;


--
-- Name: audio; Type: TABLE; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

CREATE TABLE audio (
    aid integer NOT NULL,
    mid integer,
    aname character varying(50),
    aaddress character varying(100),
    atype character varying(3)
);


ALTER TABLE public.audio OWNER TO whitestoneadmin;

--
-- Name: audio_aid_seq; Type: SEQUENCE; Schema: public; Owner: whitestoneadmin
--

CREATE SEQUENCE audio_aid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audio_aid_seq OWNER TO whitestoneadmin;

--
-- Name: audio_aid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whitestoneadmin
--

ALTER SEQUENCE audio_aid_seq OWNED BY audio.aid;


--
-- Name: credential; Type: TABLE; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

CREATE TABLE credential (
    cid integer NOT NULL,
    email character varying(50),
    pin character varying
);


ALTER TABLE public.credential OWNER TO whitestoneadmin;

--
-- Name: credential_cid_seq; Type: SEQUENCE; Schema: public; Owner: whitestoneadmin
--

CREATE SEQUENCE credential_cid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.credential_cid_seq OWNER TO whitestoneadmin;

--
-- Name: credential_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whitestoneadmin
--

ALTER SEQUENCE credential_cid_seq OWNED BY credential.cid;


--
-- Name: meeting; Type: TABLE; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

CREATE TABLE meeting (
    mid integer NOT NULL,
    mdate character varying,
    mtime time without time zone,
    mname character varying(50),
    mdescription character varying(200),
    mstatus character varying(8)
);


ALTER TABLE public.meeting OWNER TO whitestoneadmin;

--
-- Name: meeting_mid_seq; Type: SEQUENCE; Schema: public; Owner: whitestoneadmin
--

CREATE SEQUENCE meeting_mid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.meeting_mid_seq OWNER TO whitestoneadmin;

--
-- Name: meeting_mid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whitestoneadmin
--

ALTER SEQUENCE meeting_mid_seq OWNED BY meeting.mid;


--
-- Name: turn; Type: TABLE; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

CREATE TABLE turn (
    rid integer NOT NULL,
    uid integer,
    request boolean,
    approval character varying(6)
);


ALTER TABLE public.turn OWNER TO whitestoneadmin;

--
-- Name: turn_rid_seq; Type: SEQUENCE; Schema: public; Owner: whitestoneadmin
--

CREATE SEQUENCE turn_rid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.turn_rid_seq OWNER TO whitestoneadmin;

--
-- Name: turn_rid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whitestoneadmin
--

ALTER SEQUENCE turn_rid_seq OWNED BY turn.rid;


--
-- Name: users; Type: TABLE; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

CREATE TABLE users (
    uid integer NOT NULL,
    cid integer,
    ufirstname character varying(20),
    ulastname character varying(20),
    udescription character varying(150),
    urole character varying(50),
    uclassification character varying(50)
);


ALTER TABLE public.users OWNER TO whitestoneadmin;

--
-- Name: users_uid_seq; Type: SEQUENCE; Schema: public; Owner: whitestoneadmin
--

CREATE SEQUENCE users_uid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_uid_seq OWNER TO whitestoneadmin;

--
-- Name: users_uid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whitestoneadmin
--

ALTER SEQUENCE users_uid_seq OWNED BY users.uid;


--
-- Name: votein; Type: TABLE; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

CREATE TABLE votein (
    uid integer NOT NULL,
    vid integer NOT NULL,
    exercised_vote boolean
);


ALTER TABLE public.votein OWNER TO whitestoneadmin;

--
-- Name: votingchoice; Type: TABLE; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

CREATE TABLE votingchoice (
    altid integer NOT NULL,
    vid integer,
    choice character varying(100),
    votes integer
);


ALTER TABLE public.votingchoice OWNER TO whitestoneadmin;

--
-- Name: votingchoice_altid_seq; Type: SEQUENCE; Schema: public; Owner: whitestoneadmin
--

CREATE SEQUENCE votingchoice_altid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.votingchoice_altid_seq OWNER TO whitestoneadmin;

--
-- Name: votingchoice_altid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whitestoneadmin
--

ALTER SEQUENCE votingchoice_altid_seq OWNED BY votingchoice.altid;


--
-- Name: votingquestion; Type: TABLE; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

CREATE TABLE votingquestion (
    vid integer NOT NULL,
    mid integer,
    vinstructions character varying(200),
    vdate character varying,
    vtime time without time zone,
    vquestion character varying(200),
    selectionlimit character varying(2),
    vstatus character varying(8)
);


ALTER TABLE public.votingquestion OWNER TO whitestoneadmin;

--
-- Name: votingquestion_vid_seq; Type: SEQUENCE; Schema: public; Owner: whitestoneadmin
--

CREATE SEQUENCE votingquestion_vid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.votingquestion_vid_seq OWNER TO whitestoneadmin;

--
-- Name: votingquestion_vid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: whitestoneadmin
--

ALTER SEQUENCE votingquestion_vid_seq OWNED BY votingquestion.vid;


--
-- Name: logid; Type: DEFAULT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY activitylog ALTER COLUMN logid SET DEFAULT nextval('activitylog_logid_seq'::regclass);


--
-- Name: aid; Type: DEFAULT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY audio ALTER COLUMN aid SET DEFAULT nextval('audio_aid_seq'::regclass);


--
-- Name: cid; Type: DEFAULT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY credential ALTER COLUMN cid SET DEFAULT nextval('credential_cid_seq'::regclass);


--
-- Name: mid; Type: DEFAULT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY meeting ALTER COLUMN mid SET DEFAULT nextval('meeting_mid_seq'::regclass);


--
-- Name: rid; Type: DEFAULT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY turn ALTER COLUMN rid SET DEFAULT nextval('turn_rid_seq'::regclass);


--
-- Name: uid; Type: DEFAULT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY users ALTER COLUMN uid SET DEFAULT nextval('users_uid_seq'::regclass);


--
-- Name: altid; Type: DEFAULT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY votingchoice ALTER COLUMN altid SET DEFAULT nextval('votingchoice_altid_seq'::regclass);


--
-- Name: vid; Type: DEFAULT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY votingquestion ALTER COLUMN vid SET DEFAULT nextval('votingquestion_vid_seq'::regclass);


--
-- Data for Name: activitylog; Type: TABLE DATA; Schema: public; Owner: whitestoneadmin
--

COPY activitylog (logid, date, "time", urole, uemail, logmessage) FROM stdin;
\.


--
-- Name: activitylog_logid_seq; Type: SEQUENCE SET; Schema: public; Owner: whitestoneadmin
--

SELECT pg_catalog.setval('activitylog_logid_seq', 6, true);


--
-- Data for Name: audio; Type: TABLE DATA; Schema: public; Owner: whitestoneadmin
--

COPY audio (aid, mid, aname, aaddress, atype) FROM stdin;
\.


--
-- Name: audio_aid_seq; Type: SEQUENCE SET; Schema: public; Owner: whitestoneadmin
--

SELECT pg_catalog.setval('audio_aid_seq', 33, true);


--
-- Data for Name: credential; Type: TABLE DATA; Schema: public; Owner: whitestoneadmin
--

COPY credential (cid, email, pin) FROM stdin;
22	martin.melendez@upr.edu	\\xc30d04070302ee01ef8e6b99884f72d23501ad72f51c25ff824c5c8eaea41d16ce02c34740369efbb79675180f7b29b2a3536c0aa1032a444f694be96c626b8448d93a950d39
\.


--
-- Name: credential_cid_seq; Type: SEQUENCE SET; Schema: public; Owner: whitestoneadmin
--

SELECT pg_catalog.setval('credential_cid_seq', 22, true);


--
-- Data for Name: meeting; Type: TABLE DATA; Schema: public; Owner: whitestoneadmin
--

COPY meeting (mid, mdate, mtime, mname, mdescription, mstatus) FROM stdin;
\.


--
-- Name: meeting_mid_seq; Type: SEQUENCE SET; Schema: public; Owner: whitestoneadmin
--

SELECT pg_catalog.setval('meeting_mid_seq', 31, true);


--
-- Data for Name: turn; Type: TABLE DATA; Schema: public; Owner: whitestoneadmin
--

COPY turn (rid, uid, request, approval) FROM stdin;
\.


--
-- Name: turn_rid_seq; Type: SEQUENCE SET; Schema: public; Owner: whitestoneadmin
--

SELECT pg_catalog.setval('turn_rid_seq', 83, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: whitestoneadmin
--

COPY users (uid, cid, ufirstname, ulastname, udescription, urole, uclassification) FROM stdin;
21	22	Martin	Melenedez	Whitestone Super Administrator	Administrator	Staff
\.


--
-- Name: users_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: whitestoneadmin
--

SELECT pg_catalog.setval('users_uid_seq', 21, true);


--
-- Data for Name: votein; Type: TABLE DATA; Schema: public; Owner: whitestoneadmin
--

COPY votein (uid, vid, exercised_vote) FROM stdin;
\.


--
-- Data for Name: votingchoice; Type: TABLE DATA; Schema: public; Owner: whitestoneadmin
--

COPY votingchoice (altid, vid, choice, votes) FROM stdin;
\.


--
-- Name: votingchoice_altid_seq; Type: SEQUENCE SET; Schema: public; Owner: whitestoneadmin
--

SELECT pg_catalog.setval('votingchoice_altid_seq', 50, true);


--
-- Data for Name: votingquestion; Type: TABLE DATA; Schema: public; Owner: whitestoneadmin
--

COPY votingquestion (vid, mid, vinstructions, vdate, vtime, vquestion, selectionlimit, vstatus) FROM stdin;
\.


--
-- Name: votingquestion_vid_seq; Type: SEQUENCE SET; Schema: public; Owner: whitestoneadmin
--

SELECT pg_catalog.setval('votingquestion_vid_seq', 25, true);


--
-- Name: activitylog_pkey; Type: CONSTRAINT; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

ALTER TABLE ONLY activitylog
    ADD CONSTRAINT activitylog_pkey PRIMARY KEY (logid);


--
-- Name: audio_pkey; Type: CONSTRAINT; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

ALTER TABLE ONLY audio
    ADD CONSTRAINT audio_pkey PRIMARY KEY (aid);


--
-- Name: credential_pkey; Type: CONSTRAINT; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

ALTER TABLE ONLY credential
    ADD CONSTRAINT credential_pkey PRIMARY KEY (cid);


--
-- Name: meeting_pkey; Type: CONSTRAINT; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

ALTER TABLE ONLY meeting
    ADD CONSTRAINT meeting_pkey PRIMARY KEY (mid);


--
-- Name: turn_pkey; Type: CONSTRAINT; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

ALTER TABLE ONLY turn
    ADD CONSTRAINT turn_pkey PRIMARY KEY (rid);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- Name: votein_pkey; Type: CONSTRAINT; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

ALTER TABLE ONLY votein
    ADD CONSTRAINT votein_pkey PRIMARY KEY (uid, vid);


--
-- Name: votingchoice_pkey; Type: CONSTRAINT; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

ALTER TABLE ONLY votingchoice
    ADD CONSTRAINT votingchoice_pkey PRIMARY KEY (altid);


--
-- Name: votingquestion_pkey; Type: CONSTRAINT; Schema: public; Owner: whitestoneadmin; Tablespace: 
--

ALTER TABLE ONLY votingquestion
    ADD CONSTRAINT votingquestion_pkey PRIMARY KEY (vid);


--
-- Name: audio_mid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY audio
    ADD CONSTRAINT audio_mid_fkey FOREIGN KEY (mid) REFERENCES meeting(mid);


--
-- Name: turn_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY turn
    ADD CONSTRAINT turn_uid_fkey FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE;


--
-- Name: users_cid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_cid_fkey FOREIGN KEY (cid) REFERENCES credential(cid) ON DELETE CASCADE;


--
-- Name: votein_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY votein
    ADD CONSTRAINT votein_uid_fkey FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE;


--
-- Name: votein_vid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY votein
    ADD CONSTRAINT votein_vid_fkey FOREIGN KEY (vid) REFERENCES votingquestion(vid);


--
-- Name: votingchoice_vid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY votingchoice
    ADD CONSTRAINT votingchoice_vid_fkey FOREIGN KEY (vid) REFERENCES votingquestion(vid);


--
-- Name: votingquestion_mid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: whitestoneadmin
--

ALTER TABLE ONLY votingquestion
    ADD CONSTRAINT votingquestion_mid_fkey FOREIGN KEY (mid) REFERENCES meeting(mid);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

