import { useEffect, useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';
import styled from 'styled-components';

// ── Layout ────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: #F5F5F5;
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #F4F4F5;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
`;

const LogoMark = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #18181B;
  letter-spacing: -0.02em;
`;

const NavBackBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F4F4F5;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #3F3F46;
  text-decoration: none;
  transition: background 0.2s ease;
  &:hover { background: #E4E4E7; }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.85; }

  ${props => props.$variant === 'edit' && `background: #F4F4F5; color: #3F3F46;`}
  ${props => props.$variant === 'delete' && `background: #FEE2E2; color: #EF4444;`}
`;

// ── Body ──────────────────────────────────────────────────────────────────
const Body = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 160px;
  display: flex;
  gap: 32px;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
    padding: 24px 16px;
  }
`;

// ── Left col ──────────────────────────────────────────────────────────────
const LeftCol = styled.div`
  width: 460px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const WishCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #F4F4F5;
`;

const WishImg = styled.img`
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
`;

const WishImgPlaceholder = styled.div`
  width: 100%;
  height: 240px;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WishCardBody = styled.div`
  padding: 20px;
`;

const WishTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 800;
  color: #18181B;
  margin: 0 0 8px 0;
`;

const WishDesc = styled.p`
  font-size: 14px;
  color: #71717A;
  margin: 0 0 16px 0;
  line-height: 1.6;
`;

const WishGoalRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const WishGoalLabel = styled.span`
  font-size: 13px;
  color: #A1A1AA;
`;

const WishGoalVal = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: #8B5CF6;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #F4F4F5;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%);
  border-radius: 999px;
`;

const ProgressMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #A1A1AA;
`;

// ── Edit form ─────────────────────────────────────────────────────────────
const EditCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #F4F4F5;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EditTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #18181B;
  margin: 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #71717A;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 1.5px solid #E4E4E7;
  border-radius: 8px;
  font-size: 14px;
  color: #18181B;
  outline: none;
  transition: border-color 0.2s ease;
  &:focus { border-color: #8B5CF6; }
`;

const Textarea = styled.textarea`
  padding: 10px 14px;
  border: 1.5px solid #E4E4E7;
  border-radius: 8px;
  font-size: 14px;
  color: #18181B;
  resize: vertical;
  min-height: 80px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s ease;
  &:focus { border-color: #8B5CF6; }
`;

const EditBtnRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const SaveBtn = styled.button`
  padding: 9px 18px;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.9; }
`;

const CancelBtn = styled.button`
  padding: 9px 18px;
  background: #F4F4F5;
  color: #3F3F46;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover { background: #E4E4E7; }
`;

// ── Right col ─────────────────────────────────────────────────────────────
const RightCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #F4F4F5;
`;

const ChartCardTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: #18181B;
  margin: 0 0 20px 0;
`;

const ChartWrap = styled.div`
  position: relative;
  height: 280px;
`;

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
`;

const LegendLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const LegendName = styled.span`
  color: #3F3F46;
`;

const LegendVal = styled.span`
  font-weight: 600;
  color: #18181B;
`;

// ── Contributors ──────────────────────────────────────────────────────────
const ContributorsCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #F4F4F5;
`;

const ContributorsTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: #18181B;
  margin: 0 0 16px 0;
`;

const ContributorItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F4F4F5;

  &:last-child { border-bottom: none; }
`;

const ContributorLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ContributorAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
`;

const ContributorInfo = styled.div``;

const ContributorName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #18181B;
  margin: 0 0 2px 0;
`;

const ContributorDate = styled.p`
  font-size: 12px;
  color: #A1A1AA;
  margin: 0;
`;

const ContributorAmount = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #8B5CF6;
`;

const EmptyContributors = styled.p`
  color: #A1A1AA;
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
  margin: 0;
`;

// ── Loading / Error states ────────────────────────────────────────────────
const CenterWrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid #E4E4E7;
  border-top: 3px solid #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

// ── Component ─────────────────────────────────────────────────────────────
const Note = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [data, setData] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', noteUrl: '' });

  const router = useRouter();
  const noteId = router.query.id;

  const deleteNote = async () => {
    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      router.push('/');
    } catch (error) { console.log(error); }
  };

  const updateNote = async () => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updatedNote = await res.json();
        setNote(updatedNote.data);
        setIsEditing(false);
        getPaymentsData(noteId, updatedNote.data);
      }
    } catch (error) { console.error('Error updating note:', error); }
  };

  const handleEditClick = () => {
    if (note) {
      setEditForm({ title: note.title || '', description: note.description || '', price: note.price || '', noteUrl: note.noteUrl || '' });
      setIsEditing(true);
    }
  };

  const getPaymentsData = async (noteId, note) => {
    try {
      const res = await fetch(`/api/getStripePaymentsForGift?giftId=${noteId}`, {
        method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const resJSON = await res.json();
      const COLORS = ['#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#3B82F6', '#EF4444'];
      const paymentSlices = resJSON.payments.map((payment, i) => ({
        name: payment.senderName,
        value: payment.amount,
        color: COLORS[i % COLORS.length],
        details: payment.description,
        cardHTML: payment.cardHTML,
        date: payment.date,
      }));
      setContributors(paymentSlices);
      const totalGoal = parseFloat(note.price);
      const totalPaid = resJSON.totalPaid;
      const remaining = Math.max(0, totalGoal - totalPaid);
      setData([
        ...paymentSlices,
        { name: 'Remaining', value: remaining, color: '#E4E4E7' },
      ]);
    } catch (error) { console.error('Error fetching payments:', error); }
  };

  const getInitialProps = async (noteId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notes/${noteId}`);
      const response = await res.json();
      if (response.success && response.data) {
        setNote(response.data);
        getPaymentsData(noteId, response.data);
      } else {
        setNote(null);
      }
    } catch (error) {
      setNote(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!noteId) return;
    getInitialProps(noteId);
  }, [noteId]);

  if (loading) {
    return <CenterWrap><Spinner /></CenterWrap>;
  }

  if (!note) {
    return (
      <CenterWrap>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#3F3F46', marginBottom: 16 }}>Note not found.</p>
          <Link href="/" style={{ color: '#8B5CF6', fontWeight: 600 }}>Back to Dashboard</Link>
        </div>
      </CenterWrap>
    );
  }

  const totalPaid = data.filter(d => d.name !== 'Remaining').reduce((s, d) => s + d.value, 0);
  const totalGoal = parseFloat(note.price) || 0;
  const progress = totalGoal > 0 ? Math.min(100, Math.round((totalPaid / totalGoal) * 100)) : 0;
  const cur = note.currency || 'USD';

  return (
    <Page>
      <TopBar>
        <LogoMark>
          <LogoIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20 12V22H4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7H2V12H22V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H7.5C6.84 7 6.2 6.74 5.73 6.27C5.26 5.8 5 5.16 5 4.5C5 3.84 5.26 3.2 5.73 2.73C6.2 2.26 6.84 2 7.5 2C11 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H16.5C17.16 7 17.8 6.74 18.27 6.27C18.74 5.8 19 5.16 19 4.5C19 3.84 18.74 3.2 18.27 2.73C17.8 2.26 17.16 2 16.5 2C13 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </LogoIcon>
          <LogoText>GiftEasy</LogoText>
        </LogoMark>

        <NavBackBtn href="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </NavBackBtn>

        <NavActions>
          <NavBtn $variant="edit" onClick={handleEditClick}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Edit
          </NavBtn>
          <NavBtn $variant="delete" onClick={deleteNote}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Delete
          </NavBtn>
        </NavActions>
      </TopBar>

      <Body>
        {/* Left */}
        <LeftCol>
          <WishCard>
            {note.noteUrl ? (
              <WishImg src={note.noteUrl} alt={note.title} />
            ) : (
              <WishImgPlaceholder>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#D1D5DB" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="#D1D5DB"/>
                  <path d="M21 15l-5-5-4 4" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </WishImgPlaceholder>
            )}
            <WishCardBody>
              <WishTitle>{note.title}</WishTitle>
              <WishDesc>{note.description}</WishDesc>
              <WishGoalRow>
                <WishGoalLabel>Goal</WishGoalLabel>
                <WishGoalVal>${note.price}</WishGoalVal>
              </WishGoalRow>
              <ProgressBar>
                <ProgressFill style={{ width: `${progress}%` }} />
              </ProgressBar>
              <ProgressMeta>
                <span>{totalPaid} {cur} raised · {contributors.length} contributors</span>
                <span>{progress}% funded</span>
              </ProgressMeta>
            </WishCardBody>
          </WishCard>

          {isEditing && (
            <EditCard>
              <EditTitle>Edit Gift Details</EditTitle>
              <FormGroup>
                <Label>Title</Label>
                <Input type="text" value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} />
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <Textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              </FormGroup>
              <FormGroup>
                <Label>Price</Label>
                <Input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm(p => ({ ...p, price: e.target.value }))} />
              </FormGroup>
              <FormGroup>
                <Label>Image URL</Label>
                <Input type="url" value={editForm.noteUrl} onChange={(e) => setEditForm(p => ({ ...p, noteUrl: e.target.value }))} placeholder="https://example.com/image.jpg" />
              </FormGroup>
              <EditBtnRow>
                <CancelBtn onClick={() => setIsEditing(false)}>Cancel</CancelBtn>
                <SaveBtn onClick={updateNote}>Save Changes</SaveBtn>
              </EditBtnRow>
            </EditCard>
          )}
        </LeftCol>

        {/* Right */}
        <RightCol>
          <ChartCard>
            <ChartCardTitle>Contribution Progress</ChartCardTitle>
            {data.length > 0 ? (
              <>
                <ChartWrap>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="52%"
                        outerRadius="72%"
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        paddingAngle={2}
                      >
                        {data.map((entry, index) => (
                          <Cell key={entry.name} fill={entry.color} opacity={activeIndex === index ? 0.8 : 1} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} ${cur}`, name]}
                        contentStyle={{ borderRadius: 10, border: '1px solid #F4F4F5', fontSize: 13 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#18181B', lineHeight: 1 }}>{progress}%</div>
                    <div style={{ fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>funded</div>
                  </div>
                </ChartWrap>

                <LegendList>
                  {data.filter(d => d.name !== 'Remaining').map((item) => (
                    <LegendItem key={item.name}>
                      <LegendLeft>
                        <LegendDot $color={item.color} />
                        <LegendName>{item.name}</LegendName>
                      </LegendLeft>
                      <LegendVal>+{item.value} {cur}</LegendVal>
                    </LegendItem>
                  ))}
                  <LegendItem>
                    <LegendLeft>
                      <LegendDot $color="#E4E4E7" />
                      <LegendName style={{ color: '#A1A1AA' }}>Remaining</LegendName>
                    </LegendLeft>
                    <LegendVal style={{ color: '#A1A1AA' }}>{Math.max(0, totalGoal - totalPaid)} {cur}</LegendVal>
                  </LegendItem>
                </LegendList>
              </>
            ) : (
              <p style={{ color: '#A1A1AA', textAlign: 'center', padding: '32px 0', margin: 0 }}>No contributions yet</p>
            )}
          </ChartCard>

          <ContributorsCard>
            <ContributorsTitle>Contributors</ContributorsTitle>
            {contributors.length > 0 ? contributors.map((item, i) => (
              <ContributorItem key={i}>
                <ContributorLeft>
                  <ContributorAvatar>{item.name ? item.name.charAt(0).toUpperCase() : '?'}</ContributorAvatar>
                  <ContributorInfo>
                    <ContributorName>{item.name}</ContributorName>
                    <ContributorDate>{item.date ? new Date(item.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</ContributorDate>
                  </ContributorInfo>
                </ContributorLeft>
                <ContributorAmount>+{item.value} {cur}</ContributorAmount>
              </ContributorItem>
            )) : (
              <EmptyContributors>No contributors yet — share your wishlist to get started!</EmptyContributors>
            )}
          </ContributorsCard>
        </RightCol>
      </Body>
    </Page>
  );
};

export default Note;
