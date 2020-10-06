() => {
    const [startDate, setStartDate] = useState(new Date());
    const renderDayContents = (day, date) => {
        const tooltipText = `Tooltip for date: ${date}`;
        return <span title={tooltipText}>{day}</span>;
    };
    return (
        <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            renderDayContents={renderDayContents}
        />
    );
};
