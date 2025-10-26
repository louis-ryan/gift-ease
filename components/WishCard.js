import React from 'react';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

// Styled Components
const Card = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  padding-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: scale(1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

const CardBackgroundImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
  object-fit: cover;
  top: 0;
  left: 0;
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%);
  z-index: 1;
`;

const CardContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 20px;
  color: white;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
`;

const CardPrice = styled.p`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: white;
`;

const PieChartContainer = styled.div`
  width: 100%;
  height: 200px;
  transition: transform 0.3s ease;
`;

const WishCard = ({ note }) => {
  const router = useRouter();

  const paidConvert = Math.ceil((note.paid / note.price) * note.amount);
  const remainingVal = note.price - note.paid;

  const data = [
    {
      name: 'Paid',
      value: note.paid,
      color: '#10b981',
    },
    {
      name: 'Remaining',
      value: remainingVal,
      color: '#6b7280',
    },
  ];

  return (
    <Card
      onMouseEnter={(e) => {
        // Scale up the pie chart
        const chartContainer = e.currentTarget.querySelector(
          '.pie-chart-container'
        );
        if (chartContainer) {
          chartContainer.style.transform = 'scale(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        // Scale down the pie chart
        const chartContainer = e.currentTarget.querySelector(
          '.pie-chart-container'
        );
        if (chartContainer) {
          chartContainer.style.transform = 'scale(1)';
        }
      }}
      onClick={() => {
        router.push(`/${note._id}`);
      }}
    >
      {note.noteUrl && (
        <CardBackgroundImage
          src={note.noteUrl}
          alt="note image"
        />
      )}
      {note.noteUrl && (
        <img
          src={note.noteUrl}
          alt="note image"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: '2',
            objectFit: 'cover',
            top: '0',
            left: '0',
            maskImage:
              'radial-gradient(circle at 50% 65%, black 60px, transparent 60px)',
            WebkitMaskImage:
              'radial-gradient(circle at 50% 65%, black 60px, transparent 60px)',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          borderRadius: '12px',
          zIndex: '0',
          maskImage:
            'radial-gradient(circle at 50% 65%, transparent 60px, black 60px)',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 65%, transparent 60px, black 60px)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            'rgba(0, 0, 0, 0.4)';
          e.currentTarget.style.backdropFilter = 'blur(8px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor =
            'rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.backdropFilter = 'blur(5px)';
        }}
      />
      <div
        style={{
          padding: '16px',
          position: 'relative',
          zIndex: '1',
        }}
      >
        <h3
          style={{
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            margin: '0 0 8px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            lineHeight: '1.2',
          }}
        >
          {note.title}
        </h3>
        <h4
          style={{
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '0.01em',
            lineHeight: '1.3',
            opacity: '0.9',
          }}
        >
          {paidConvert ? paidConvert : note.paid}
          {note.currency ? note.currency : 'USD'}
          {' of '}
          {note.amount ? note.amount : note.price}
          {note.currency ? note.currency : 'USD'}
        </h4>
        <p
          style={{
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            margin: '0',
            fontSize: '12px',
            fontWeight: '400',
            letterSpacing: '0.02em',
            lineHeight: '1.4',
            opacity: '0.8',
            textTransform: 'uppercase',
          }}
        >
          {note.senders && note.senders.length}
          {note.senders
            ? ` contributer${note.senders.length < 2 ? '' : 's'}`
            : 'no contributions yet'}
        </p>
      </div>
      <div style={{ height: '12px' }} />
      <div
        className="pie-chart-container"
        style={{
          opacity: '0.9',
          position: 'relative',
          zIndex: '3',
          transition: 'all 0.3s ease',
          transform: 'scale(1)',
        }}
      >
        <ResponsiveContainer
          width="100%"
          height={140}
        >
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={70}
              dataKey="value"
              paddingAngle={0}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="gapver" />
      <div className="gapver" />
    </Card>
  );
};

export default WishCard;
