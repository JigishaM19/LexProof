import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent / "data"
os.makedirs(BASE_DIR, exist_ok=True)

# ------------------------------------------------------------------------------
# 1. STATES & UTs (LGD PDF: List of All States - 36 records)
# ------------------------------------------------------------------------------
STATES_DATA_RAW = """
1	35	1	Andaman And Nicobar Islands	Andaman And Nicobar Islands	35	35	U
2	28	2	Andhra Pradesh	Andhra Pradesh	28	28	S
3	12	1	Arunachal Pradesh	Arunachal Pradesh	12	12	S
4	18	1	Assam	Assam	18	18	S
5	10	1	Bihar	Bihar	10	10	S
6	4	1	Chandigarh	Chandigarh	04	04	U
7	22	1	Chhattisgarh	Chhattisgarh	22	22	S
8	7	1	Delhi	Delhi	07	07	U
9	30	1	Goa	Goa	30	30	S
10	24	1	Gujarat	Gujarat	24	24	S
11	6	1	Haryana	Haryana	06	06	S
12	2	1	Himachal Pradesh	Himachal Pradesh	02	02	S
13	1	3	Jammu And Kashmir	Jammu And Kashmir	01	01	U
14	20	1	Jharkhand	Jharkhand	20	20	S
15	29	1	Karnataka	Karnataka	29	29	S
16	32	1	Kerala	Kerala	32	32	S
17	37	1	Ladakh	Ladakh		00	U
18	31	1	Lakshadweep	Lakshadweep	31	31	U
19	23	1	Madhya Pradesh	Madhya Pradesh	23	23	S
20	27	1	Maharashtra	Maharashtra	27	27	S
21	14	1	Manipur	Manipur	14	14	S
22	17	1	Meghalaya	Meghalaya	17	17	S
23	15	1	Mizoram	Mizoram	15	15	S
24	13	1	Nagaland	Nagaland	13	13	S
25	21	1	Odisha	Odisha	21	21	S
26	34	1	Puducherry	Puducherry	34	34	U
27	3	1	Punjab	Punjab	03	03	S
28	8	1	Rajasthan	Rajasthan	08	08	S
29	11	1	Sikkim	Sikkim	11	11	S
30	33	1	Tamil Nadu	Tamil Nadu	33	33	S
31	36	1	Telangana	Telangana		00	S
32	38	1	The Dadra And Nagar Haveli And Daman And Diu	The Dadra And Nagar Haveli And Daman And Diu			U
33	16	1	Tripura	Tripura	16	16	S
34	5	1	Uttarakhand	Uttarakhand	05	05	S
35	9	1	Uttar Pradesh	Uttar Pradesh	09	09	S
36	19	1	West Bengal	West Bengal	19	19	S
"""

STATE_ISO_MAP = {
    35: "IN-AN", 28: "IN-AP", 12: "IN-AR", 18: "IN-AS", 10: "IN-BR", 4: "IN-CH",
    22: "IN-CT", 7: "IN-DL", 30: "IN-GA", 24: "IN-GJ", 6: "IN-HR", 2: "IN-HP",
    1: "IN-JK", 20: "IN-JH", 29: "IN-KA", 32: "IN-KL", 37: "IN-LA", 31: "IN-LD",
    23: "IN-MP", 27: "IN-MH", 14: "IN-MN", 17: "IN-ML", 15: "IN-MZ", 13: "IN-NL",
    21: "IN-OR", 34: "IN-PY", 3: "IN-PB", 8: "IN-RJ", 11: "IN-SK", 33: "IN-TN",
    36: "IN-TG", 38: "IN-DH", 16: "IN-TR", 5: "IN-UT", 9: "IN-UP", 19: "IN-WB"
}

def build_states():
    states = []
    lines = [l for l in STATES_DATA_RAW.strip().split("\n") if l.strip()]
    for line in lines:
        parts = line.split("\t")
        s_no = int(parts[0].strip())
        state_code = int(parts[1].strip())
        state_ver = int(parts[2].strip())
        name_en = parts[3].strip()
        name_local = parts[4].strip() if len(parts) > 4 and parts[4].strip() else name_en
        c2001 = parts[5].strip() if len(parts) > 5 and parts[5].strip() else None
        c2011 = parts[6].strip() if len(parts) > 6 and parts[6].strip() else None
        state_ut = parts[7].strip() if len(parts) > 7 and parts[7].strip() else ("U" if "And" in name_en or name_en in ["Delhi", "Chandigarh", "Ladakh", "Lakshadweep", "Puducherry"] else "S")
        admin_type = "Union Territory" if state_ut == "U" else "State"
        iso_id = STATE_ISO_MAP.get(state_code, f"IN-{state_code:02d}")

        states.append({
            "id": iso_id,
            "country_id": "IN",
            "name": name_en,
            "name_local": name_local,
            "code": iso_id.replace("IN-", ""),
            "lgd_code": state_code,
            "version": state_ver,
            "census_2001_code": c2001,
            "census_2011_code": c2011,
            "state_or_ut": state_ut,
            "admin_type": admin_type,
            "source_document": "Local Government Directory - List Of All States",
            "extraction_date": "2026-10-12"
        })
    return states

# ------------------------------------------------------------------------------
# 2. SUBDISTRICTS OF MAHARASHTRA (LGD PDF - 358 records)
# ------------------------------------------------------------------------------
SUBDISTRICTS_TSV = """1	468	Amravati	4004	2	Achalpur		4	04004
2	475	Gadchiroli	4062	1	Aheri		11	04062
3	481	Latur	4228	2	Ahmadpur		3	04228
4	480	Kolhapur	4292	1	Ajra		10	04292
5	496	Solapur	4254	1	Akkalkot		11	04254
6	486	Nandurbar	3950	1	Akkalkuwa		1	03950
7	467	Akola	3991	1	Akola		4	03991
8	466	Ahilyanagar	4201	2	Akole		0001	04201
9	467	Akola	3989	1	Akot		2	03989
10	486	Nandurbar	3951	1	Akrani		2	03951
11	491	Raigad	4177	1	Alibag		6	04177
12	478	Jalgaon	3969	1	Amalner		10	03969
13	479	Jalna	4129	1	Ambad		5	04129
14	497	Thane	4170	1	Ambarnath		14	04170
15	490	Pune	4188	1	Ambegaon		2	04188
16	470	Beed	4225	2	Ambejogai		11	04225
17	476	Gondia	4047	1	Amgaon		4	04047
18	468	Amravati	4009	1	Amravati		9	04009
19	483	Mumbai Suburban	7179	1	Andheri			00000
20	468	Amravati	4003	1	Anjangaon Surji		3	04003
21	485	Nanded	4099	3	Ardhapur		5	04099
22	476	Gondia	4050	1	Arjuni Morgaon		7	04050
23	475	Gadchiroli	4053	1	Armori		2	04053
24	500	Yavatmal	4088	1	Arni		10	04088
25	498	Wardha	4017	2	Arvi		3	04017
26	498	Wardha	4015	1	Ashti		1	04015
27	470	Beed	4215	1	Ashti		1	04215
28	493	Sangli	4300	1	Atpadi		5	04300
29	477	Hingoli	4113	1	Aundha (Nagnath)	()	3	04113
30	481	Latur	4232	2	Ausa		7	04232
31	500	Yavatmal	4080	1	Babulgaon		2	04080
32	479	Jalna	4128	1	Badnapur		4	04128
33	487	Nashik	4145	1	Baglan		4	04145
34	467	Akola	3990	1	Balapur		3	03990
35	473	Chandrapur	4074	1	Ballarpur		11	04074
36	490	Pune	4199	1	Baramati		13	04199
37	496	Solapur	4246	3	Barshi		3	04246
38	467	Akola	3994	1	Barshitakli		7	03994
39	470	Beed	4221	2	Beed		7	04221
40	478	Jalgaon	3971	1	Bhadgaon		12	03971
41	473	Chandrapur	4070	1	Bhadravati		7	04070
42	475	Gadchiroli	4061	1	Bhamragad		10	04061
43	471	Bhandara	4039	1	Bhandara		3	04039
44	468	Amravati	4010	1	Bhatkuli		10	04010
45	497	Thane	4166	1	Bhiwandi		10	04166
46	484	Nagpur	4036	1	Bhiwapur		14	04036
47	485	Nanded	4102	1	Bhokar		8	04102
48	479	Jalna	4125	2	Bhokardan		1	04125
49	490	Pune	4198	1	Bhor		12	04198
50	480	Kolhapur	4291	1	Bhudargad		9	04291
51	488	Dharashiv	4237	1	Bhum		2	04237
52	478	Jalgaon	3965	1	Bhusawal		6	03965
53	485	Nanded	4105	1	Biloli		11	04105
54	478	Jalgaon	3964	1	Bodvad		5	03964
55	483	Mumbai Suburban	7181	1	Borivali			00000
56	473	Chandrapur	4067	1	Brahmapuri		4	04067
57	472	Buldhana	3984	1	Buldana		10	03984
58	481	Latur	4230	1	Chakur		5	04230
59	478	Jalgaon	3972	1	Chalisgaon		13	03972
60	475	Gadchiroli	4058	1	Chamorshi		7	04058
61	480	Kolhapur	4294	1	Chandgad		12	04294
62	473	Chandrapur	4071	1	Chandrapur		8	04071
63	468	Amravati	4005	2	Chandurbazar		5	04005
64	468	Amravati	4013	1	Chandur Railway		13	04013
65	487	Nashik	4148	1	Chandvad		7	04148
66	469	Chhatrapati Sambhajinagar	4137	3	Chhatrapati Sambhajinagar		5	04137
67	468	Amravati	4002	1	Chikhaldara		2	04002
68	472	Buldhana	3983	1	Chikhli		9	03983
69	473	Chandrapur	4065	1	Chimur		2	04065
70	492	Ratnagiri	4269	1	Chiplun		4	04269
71	478	Jalgaon	3960	1	Chopda		1	03960
72	665	Palghar	4158	2	Dahanu		2	04158
73	492	Ratnagiri	4267	1	Dapoli		2	04267
74	500	Yavatmal	4083	1	Darwha		5	04083
75	468	Amravati	4011	1	Daryapur		11	04011
76	490	Pune	4195	1	Daund		9	04195
77	485	Nanded	4110	1	Deglur		16	04110
78	487	Nashik	4144	1	Deola		3	04144
79	472	Buldhana	3985	1	Deolgaon Raja		11	03985
80	498	Wardha	4020	1	Deoli		6	04020
81	481	Latur	4234	1	Deoni		9	04234
82	476	Gondia	4051	1	Deori		8	04051
83	475	Gadchiroli	4052	1	Desaiganj (Vadasa)	()	1	04052
84	495	Sindhudurg	4275	1	Devgad		1	04275
85	468	Amravati	4014	1	Dhamangaon Railway		14	04014
86	475	Gadchiroli	4056	1	Dhanora		5	04056
87	478	Jalgaon	3968	1	Dharangaon		9	03968
88	488	Dharashiv	4240	4	Dharashiv		5	04240
89	485	Nanded	4104	1	Dharmabad		10	04104
90	468	Amravati	4001	1	Dharni		1	04001
91	470	Beed	4223	2	Dharur		9	04223
92	474	Dhule	3959	5	Dhule		4	03959
93	500	Yavatmal	4084	1	Digras		6	04084
94	487	Nashik	4149	1	Dindori		8	04149
95	495	Sindhudurg	4282	1	Dodamarg		8	04282
96	478	Jalgaon	3967	1	Erandol		8	03967
97	475	Gadchiroli	4060	1	Etapalli		9	04060
98	475	Gadchiroli	4057	1	Gadchiroli		6	04057
99	480	Kolhapur	4293	1	Gadhinglaj		11	04293
100	480	Kolhapur	4288	2	Gaganbawada		6	04288
101	489	Parbhani	4122	1	Gangakhed		7	04122
102	469	Chhatrapati Sambhajinagar	4140	1	Gangapur		8	04140
103	470	Beed	4218	1	Georai		4	04218
104	479	Jalna	4130	1	Ghansawangi		6	04130
105	500	Yavatmal	4089	1	Ghatanji		11	04089
106	476	Gondia	4046	1	Gondiya		3	04046
107	473	Chandrapur	4078	1	Gondpipri		14	04078
108	476	Gondia	4045	1	Goregaon		2	04045
109	492	Ratnagiri	4270	1	Guhagar		5	04270
110	485	Nanded	4098	3	Hadgaon		4	04098
111	480	Kolhapur	4285	1	Hatkanangle		3	04285
112	490	Pune	4193	1	Haveli		7	04193
113	485	Nanded	4097	1	Himayatnagar		3	04097
114	498	Wardha	4021	1	Hinganghat		7	04021
115	484	Nagpur	4033	1	Hingna		11	04033
116	477	Hingoli	4112	1	Hingoli		2	04112
117	487	Nashik	4153	1	Igatpuri		12	04153
118	490	Pune	4200	1	Indapur		14	04200
119	479	Jalna	4126	2	Jafrabad		2	04126
120	478	Jalgaon	3966	1	Jalgaon		7	03966
121	472	Buldhana	3975	1	Jalgaon (Jamod)	()	1	03975
122	481	Latur	4229	1	Jalkot		4	04229
123	479	Jalna	4127	1	Jalna		3	04127
124	466	Ahilyanagar	4214	1	Jamkhed		14	04214
125	478	Jalgaon	3974	1	Jamner		15	03974
126	494	Satara	4263	4	Jaoli		9	04263
127	493	Sangli	4304	1	Jat		9	04304
128	665	Palghar	4160	2	Jawhar		4	04160
129	489	Parbhani	4117	1	Jintur		2	04117
130	473	Chandrapur	4076	1	Jiwati		0	04076
131	490	Pune	4187	1	Junnar		1	04187
132	493	Sangli	4298	1	Kadegaon		0	04298
133	480	Kolhapur	4290	1	Kagal		8	04290
134	470	Beed	4222	1	Kaij		8	04222
135	488	Dharashiv	4239	1	Kalamb		0004	04239
136	500	Yavatmal	4081	1	Kalamb		3	04081
137	484	Nagpur	4025	1	Kalameshwar		3	04025
138	477	Hingoli	4114	1	Kalamnuri		4	04114
139	487	Nashik	4143	1	Kalwan		2	04143
140	497	Thane	4168	1	Kalyan		12	04168
141	484	Nagpur	4030	1	Kamptee		8	04030
142	485	Nanded	4108	1	Kandhar		14	04108
143	495	Sindhudurg	4277	1	Kankavli		3	04277
144	469	Chhatrapati Sambhajinagar	4133	1	Kannad		1	04133
145	494	Satara	4265	1	Karad		11	04265
146	498	Wardha	4016	1	Karanja		3	04016
147	499	Washim	3997	1	Karanja		3	03997
148	466	Ahilyanagar	4213	1	Karjat		0013	04213
149	491	Raigad	4174	1	Karjat		3	04174
150	496	Solapur	4244	1	Karmala		1	04244
151	480	Kolhapur	4287	1	Karvir		5	04287
152	484	Nagpur	4024	1	Katol		2	04024
153	493	Sangli	4303	1	Kavathemahankal		8	04303
154	500	Yavatmal	4090	1	Kelapur		12	04090
155	491	Raigad	4175	1	Khalapur		4	04175
156	472	Buldhana	3981	1	Khamgaon		7	03981
157	493	Sangli	4299	1	Khanapur		4	04299
158	494	Satara	4257	1	Khandala		3	04257
159	494	Satara	4260	2	Khatav		6	04260
160	490	Pune	4190	1	Khed		4	04190
161	492	Ratnagiri	4268	1	Khed		0003	04268
162	469	Chhatrapati Sambhajinagar	4138	2	Khuldabad		6	04138
163	485	Nanded	4096	1	Kinwat		2	04096
164	466	Ahilyanagar	4203	1	Kopargaon		3	04203
165	475	Gadchiroli	4055	2	Korchi		4	04055
166	494	Satara	4261	1	Koregaon		7	04261
167	473	Chandrapur	4075	1	Korpana		12	04075
168	495	Sindhudurg	4280	1	Kudal		6	04280
169	484	Nagpur	4035	1	Kuhi		13	04035
170	475	Gadchiroli	4054	2	Kurkheda		3	04054
171	483	Mumbai Suburban	7180	1	Kurla			00000
172	471	Bhandara	4043	1	Lakhandur		7	04043
173	471	Bhandara	4041	1	Lakhani		5	04041
174	492	Ratnagiri	4273	1	Lanja		8	04273
175	481	Latur	4226	1	Latur		1	04226
176	485	Nanded	4107	1	Loha		13	04107
177	488	Dharashiv	4242	2	Lohara		7	04242
178	472	Buldhana	3987	1	Lonar		13	03987
179	496	Solapur	4245	1	Madha		2	04245
180	494	Satara	4255	2	Mahabaleshwar		1	04255
181	491	Raigad	4185	1	Mahad		14	04185
182	500	Yavatmal	4087	1	Mahagaon		9	04087
183	485	Nanded	4095	2	Mahur		1	04095
184	470	Beed	4219	2	Majalgaon		5	04219
185	499	Washim	3995	1	Malegaon		1	03995
186	487	Nashik	4146	1	Malegaon		0005	04146
187	472	Buldhana	3979	1	Malkapur		5	03979
188	496	Solapur	4250	1	Malshiras		7	04250
189	495	Sindhudurg	4278	1	Malwan		4	04278
190	494	Satara	4259	1	Man		5	04259
191	492	Ratnagiri	4266	1	Mandangad		1	04266
192	496	Solapur	4252	1	Mangalvedhe		9	04252
193	491	Raigad	4181	1	Mangaon		10	04181
194	499	Washim	3996	1	Mangrulpir		2	03996
195	499	Washim	3998	1	Manora		4	03998
196	479	Jalna	4132	1	Mantha		8	04132
197	489	Parbhani	4119	1	Manwath		4	04119
198	500	Yavatmal	4092	1	Maregaon		14	04092
199	484	Nagpur	4029	1	Mauda		7	04029
200	490	Pune	4191	1	Mawal		5	04191
201	472	Buldhana	3982	1	Mehkar		8	03982
202	491	Raigad	4184	1	Mhasla		13	04184
203	493	Sangli	4302	1	Miraj		7	04302
204	471	Bhandara	4038	1	Mohadi		2	04038
205	496	Solapur	4248	1	Mohol		5	04248
206	665	Palghar	4161	2	Mokhada		5	04161
207	468	Amravati	4006	1	Morshi		6	04006
208	472	Buldhana	3980	1	Motala		6	03980
209	485	Nanded	4101	1	Mudkhed		7	04101
210	485	Nanded	4109	1	Mukhed		15	04109
211	478	Jalgaon	3963	1	Muktainagar (Edlabad)	()	4	03963
212	473	Chandrapur	4072	1	Mul		9	04072
213	475	Gadchiroli	4059	1	Mulchera		8	04059
214	490	Pune	4192	1	Mulshi		6	04192
215	497	Thane	4171	1	Murbad		15	04171
216	467	Akola	3992	1	Murtijapur		5	03992
217	491	Raigad	4178	1	Murud		7	04178
218	466	Ahilyanagar	4209	1	Nagar		9	04209
219	473	Chandrapur	4066	2	Nagbhid		3	04066
220	484	Nagpur	4031	1	Nagpur (Rural)	()	9	04031
221	484	Nagpur	4032	1	Nagpur (Urban)	()	10	04032
222	485	Nanded	4106	1	Naigaon (Khairgaon)	()	12	04106
223	485	Nanded	4100	1	Nanded		6	04100
224	487	Nashik	4147	1	Nandgaon		6	04147
225	468	Amravati	4012	1	Nandgaon-Khandeshwar		12	04012
226	472	Buldhana	3978	1	Nandura		4	03978
227	486	Nandurbar	3954	1	Nandurbar		5	03954
228	484	Nagpur	4023	1	Narkhed		1	04023
229	487	Nashik	4152	1	Nashik		11	04152
230	486	Nandurbar	3955	1	Nawapur		6	03955
231	500	Yavatmal	4079	1	Ner		1	04079
232	466	Ahilyanagar	4206	1	Nevasa		6	04206
233	481	Latur	4233	2	Nilanga		8	04233
234	487	Nashik	4155	1	Niphad		14	04155
235	488	Dharashiv	4243	2	Omarga		8	04243
236	478	Jalgaon	3973	1	Pachora		14	03973
237	469	Chhatrapati Sambhajinagar	4141	1	Paithan		9	04141
238	489	Parbhani	4123	1	Palam		8	04123
239	665	Palghar	4163	2	Palghar		7	04163
240	493	Sangli	4297	1	Palus		3	04297
241	496	Solapur	4249	1	Pandharpur		6	04249
242	480	Kolhapur	4284	1	Panhala		2	04284
243	491	Raigad	4173	1	Panvel		2	04173
244	488	Dharashiv	4236	1	Paranda		1	04236
245	489	Parbhani	4118	1	Parbhani		3	04118
246	470	Beed	4224	3	Parli		10	04224
247	466	Ahilyanagar	4211	1	Parner		11	04211
248	478	Jalgaon	3970	1	Parola		11	03970
249	484	Nagpur	4027	1	Parseoni		5	04027
250	479	Jalna	4131	1	Partur		7	04131
251	494	Satara	4264	1	Patan		10	04264
252	466	Ahilyanagar	4208	1	Pathardi		8	04208
253	489	Parbhani	4120	1	Pathri		5	04120
254	470	Beed	4216	1	Patoda		2	04216
255	467	Akola	3993	1	Patur		6	03993
256	471	Bhandara	4042	1	Pauni		6	04042
257	491	Raigad	4176	1	Pen		5	04176
258	487	Nashik	4150	2	Peth		9	04150
259	494	Satara	4258	1	Phaltan		4	04258
260	469	Chhatrapati Sambhajinagar	4136	3	Phulambri		4	04136
261	491	Raigad	4186	1	Poladpur		15	04186
262	473	Chandrapur	4073	1	Pombhurna		10	04073
263	490	Pune	4194	1	Pune City		8	04194
264	490	Pune	4196	1	Purandhar		10	04196
265	489	Parbhani	4124	1	Purna		9	04124
266	500	Yavatmal	4085	1	Pusad		7	04085
267	480	Kolhapur	4289	1	Radhanagari		7	04289
268	466	Ahilyanagar	4204	1	Rahta		4	04204
269	466	Ahilyanagar	4210	1	Rahuri		10	04210
270	492	Ratnagiri	4274	1	Rajapur		9	04274
271	473	Chandrapur	4077	1	Rajura		13	04077
272	500	Yavatmal	4091	1	Ralegaon		13	04091
273	484	Nagpur	4028	1	Ramtek		6	04028
274	492	Ratnagiri	4271	1	Ratnagiri		6	04271
275	478	Jalgaon	3962	1	Raver		3	03962
276	481	Latur	4227	1	Renapur		2	04227
277	499	Washim	4000	1	Risod		6	04000
278	491	Raigad	4179	1	Roha		8	04179
279	476	Gondia	4049	1	Sadak-Arjuni		6	04049
280	471	Bhandara	4040	1	Sakoli		4	04040
281	474	Dhule	3958	1	Sakri		3	03958
282	476	Gondia	4048	1	Salekasa		5	04048
283	498	Wardha	4022	1	Samudrapur		8	04022
284	492	Ratnagiri	4272	1	Sangameshwar		7	04272
285	466	Ahilyanagar	4202	1	Sangamner		2	04202
286	496	Solapur	4251	1	Sangole		8	04251
287	472	Buldhana	3976	1	Sangrampur		2	03976
288	494	Satara	4262	4	Satara		8	04262
289	484	Nagpur	4026	1	Savner		4	04026
290	473	Chandrapur	4068	1	Sawali		5	04068
291	495	Sindhudurg	4281	1	Sawantwadi		7	04281
292	498	Wardha	4018	1	Seloo		4	04018
293	489	Parbhani	4116	2	Selu		1	04116
294	477	Hingoli	4111	1	Sengaon		1	04111
295	486	Nandurbar	3953	1	Shahade		4	03953
296	497	Thane	4167	1	Shahapur		11	04167
297	480	Kolhapur	4283	2	Shahuwadi		1	04283
298	472	Buldhana	3977	1	Shegaon		3	03977
299	466	Ahilyanagar	4207	1	Shevgaon		7	04207
300	493	Sangli	4295	1	Shirala		1	04295
301	480	Kolhapur	4286	2	Shirol		4	04286
302	474	Dhule	3956	3	Shirpur		1	03956
303	490	Pune	4189	1	Shirur		3	04189
304	481	Latur	4231	2	Shirur Anantpal		6	04231
305	470	Beed	4217	1	Shirur (Kasar)	()	3	04217
306	466	Ahilyanagar	4212	1	Shrigonda		12	04212
307	466	Ahilyanagar	4205	1	Shrirampur		5	04205
308	491	Raigad	4183	1	Shrivardhan		12	04183
309	469	Chhatrapati Sambhajinagar	4135	2	Sillod		3	04135
310	473	Chandrapur	4069	1	Sindewahi		6	04069
311	474	Dhule	3957	3	Sindkhede		2	03957
312	472	Buldhana	3986	1	Sindkhed Raja		12	03986
313	487	Nashik	4154	1	Sinnar		13	04154
314	475	Gadchiroli	4063	1	Sironcha		12	04063
315	469	Chhatrapati Sambhajinagar	4134	1	Soegaon		2	04134
316	496	Solapur	4247	1	Solapur North		4	04247
317	496	Solapur	4253	1	Solapur South		10	04253
318	489	Parbhani	4121	1	Sonpeth		6	04121
319	491	Raigad	4180	1	Sudhagad		9	04180
320	487	Nashik	4142	1	Surgana		1	04142
321	491	Raigad	4182	1	Tala		11	04182
322	665	Palghar	4157	2	Talasari		1	04157
323	486	Nandurbar	3952	1	Talode		3	03952
324	493	Sangli	4301	1	Tasgaon		6	04301
325	467	Akola	3988	1	Telhara		1	03988
326	497	Thane	4165	1	Thane		9	04165
327	468	Amravati	4008	2	Tiosa		8	04008
328	476	Gondia	4044	1	Tirora		1	04044
329	487	Nashik	4151	1	Trimbakeshwar		10	04151
330	488	Dharashiv	4241	1	Tuljapur		6	04241
331	471	Bhandara	4037	1	Tumsar		1	04037
332	481	Latur	4235	1	Udgir		10	04235
333	497	Thane	4169	1	Ulhasnagar		13	04169
334	500	Yavatmal	4086	1	Umarkhed		8	04086
335	484	Nagpur	4034	1	Umred		12	04034
336	485	Nanded	4103	1	Umri		9	04103
337	491	Raigad	4172	1	Uran		1	04172
338	495	Sindhudurg	4276	1	Vaibhavvadi		2	04276
339	469	Chhatrapati Sambhajinagar	4139	1	Vaijapur		7	04139
340	665	Palghar	4164	2	Vasai		8	04164
341	477	Hingoli	4115	2	Vasmath		5	04115
342	490	Pune	4197	1	Velhe		11	04197
343	495	Sindhudurg	4279	1	Vengurla		5	04279
344	665	Palghar	4159	2	Vikramgad		3	04159
345	665	Palghar	4162	3	Wada		6	04162
346	470	Beed	4220	1	Wadwani		6	04220
347	494	Satara	4256	1	Wai		2	04256
348	493	Sangli	4296	1	Walwa		2	04296
349	500	Yavatmal	4094	1	Wani		16	04094
350	498	Wardha	4019	2	Wardha		5	04019
351	473	Chandrapur	4064	1	Warora		1	04064
352	468	Amravati	4007	1	Warud		7	04007
353	488	Dharashiv	4238	1	Washi		3	04238
354	499	Washim	3999	1	Washim		5	03999
355	500	Yavatmal	4082	1	Yavatmal		4	04082
356	478	Jalgaon	3961	1	Yawal		2	03961
357	487	Nashik	4156	1	Yevla		15	04156
358	500	Yavatmal	4093	1	Zari-Jamani		15	04093"""

def build_subdistricts_and_districts():
    lines = [l for l in SUBDISTRICTS_TSV.strip().split("\n") if l.strip()]
    subdistricts = []
    districts_dict = {}

    for line in lines:
        parts = line.split("\t")
        sno = int(parts[0].strip())
        dcode = int(parts[1].strip())
        dname = parts[2].strip()
        subcode = int(parts[3].strip())
        subver = int(parts[4].strip())
        subname_en = parts[5].strip()
        subname_local = parts[6].strip() if len(parts) > 6 and parts[6].strip() else None
        c2001 = parts[7].strip() if len(parts) > 7 and parts[7].strip() else None
        c2011 = parts[8].strip() if len(parts) > 8 and parts[8].strip() else None

        district_id = f"IN-MH-{dcode}"

        if dcode not in districts_dict:
            districts_dict[dcode] = {
                "id": district_id,
                "lgd_code": dcode,
                "code": str(dcode),
                "name": dname,
                "state_id": "IN-MH",
                "state_code": 27,
                "country_id": "IN",
                "source_document": "Local Government Directory - All Subdistricts of Maharashtra (State Code: 27) State",
                "extraction_date": "2026-10-12"
            }

        subdistricts.append({
            "s_no": sno,
            "id": f"subdist-{subcode}",
            "code": subcode,
            "version": subver,
            "name": subname_en,
            "name_local": subname_local,
            "district_id": district_id,
            "district_code": dcode,
            "district_name": dname,
            "state_id": "IN-MH",
            "state_code": 27,
            "country_id": "IN",
            "census_2001_code": c2001,
            "census_2011_code": c2011,
            "source_document": "Local Government Directory - All Subdistricts of Maharashtra (State Code: 27) State",
            "extraction_date": "2026-10-12"
        })

    # Include Mumbai City (District Code 482) which is 100% urban district in Maharashtra
    if 482 not in districts_dict:
        districts_dict[482] = {
            "id": "IN-MH-482",
            "lgd_code": 482,
            "code": "482",
            "name": "Mumbai City",
            "state_id": "IN-MH",
            "state_code": 27,
            "country_id": "IN",
            "source_document": "Local Government Directory - Maharashtra Administrative Structure (Urban District)",
            "extraction_date": "2026-10-12"
        }

    districts = sorted(districts_dict.values(), key=lambda d: d["name"])
    return subdistricts, districts

if __name__ == "__main__":
    states = build_states()
    subdistricts, districts = build_subdistricts_and_districts()

    print(f"Writing {len(states)} States to lgd_states.json...")
    with open(os.path.join(BASE_DIR, "lgd_states.json"), "w", encoding="utf-8") as f:
        json.dump(states, f, indent=2, ensure_ascii=False)

    print(f"Writing {len(districts)} Districts to lgd_districts.json...")
    with open(os.path.join(BASE_DIR, "lgd_districts.json"), "w", encoding="utf-8") as f:
        json.dump(districts, f, indent=2, ensure_ascii=False)

    print(f"Writing {len(subdistricts)} Subdistricts to lgd_subdistricts.json...")
    with open(os.path.join(BASE_DIR, "lgd_subdistricts.json"), "w", encoding="utf-8") as f:
        json.dump(subdistricts, f, indent=2, ensure_ascii=False)

    print("All JSON reference files successfully created in backend/app/data/!")
