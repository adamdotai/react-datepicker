() => {
    const [startDate, setStartDate] = useState(new Date());

    let handleColor = (time) => {
        return 'text-success';
    };

    return (
        <DatePicker
            showTimeSelect
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            timeClassName={handleColor}
        />
    );
};
