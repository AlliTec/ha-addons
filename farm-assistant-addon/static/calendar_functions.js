    
    function displayCalendarEvents(events) {
        const filterType = document.getElementById('calendar-filter-type').value;
        const eventsContainer = document.getElementById('calendar-events');
        
        if (events.length === 0) {
            eventsContainer.innerHTML = '<div class="no-events">No events found for the selected period.</div>';
            updateDateDisplay();
            return;
        }
        
        // Group events by date
        const eventsByDate = {};
        events.forEach(event => {
            if (!eventsByDate[event.date]) {
                eventsByDate[event.date] = [];
            }
            eventsByDate[event.date].push(event);
        });
        
        let html = '';
        
        switch (filterType) {
            case 'day':
                html = displayDayView(eventsByDate);
                break;
            case 'week':
                html = displayWeekView(eventsByDate);
                break;
            case 'month':
                html = displayMonthView(eventsByDate);
                break;
            case 'year':
                html = displayYearView(eventsByDate);
                break;
        }
        
        eventsContainer.innerHTML = html;
        updateDateDisplay();
        
        // Add click handlers for events
        document.querySelectorAll('.calendar-event').forEach(eventElement => {
            eventElement.addEventListener('click', function() {
                const eventData = JSON.parse(this.dataset.event);
                handleCalendarEventClick(eventData);
            });
        });
        
        // Add navigation handlers
        document.getElementById('calendar-nav-prev').onclick = navigatePrevious;
        document.getElementById('calendar-nav-next').onclick = navigateNext;
    }
    
    function displayDayView(eventsByDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayEvents = eventsByDate[dateStr] || [];
        const dateObj = new Date(dateStr + 'T00:00:00');
        
        let html = `<div class="day-view">
            <div class="day-header">
                <h2>${dateObj.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</h2>
            </div>
            <div class="day-timeline">`;
        
        // Create 24-hour segments
        for (let hour = 0; hour < 24; hour++) {
            const isDaylight = hour >= sunriseTime && hour <= sunsetTime;
            const hourStr = hour.toString().padStart(2, '0') + ':00';
            
            html += `<div class="hour-segment ${isDaylight ? 'daylight' : 'nighttime'}">
                <div class="hour-label">${hourStr}</div>
                <div class="hour-events">`;
            
            if (dayEvents.length > 0 && hour === 9) { // Show events at 9 AM for simplicity
                dayEvents.forEach(event => {
                    html += createEventHTML(event);
                });
            }
            
            html += `</div></div>`;
        }
        
        html += `</div></div>`;
        return html;
    }
    
    function displayWeekView(eventsByDate) {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);
        
        let html = `<div class="week-view">
            <div class="week-grid">`;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = eventsByDate[dateStr] || [];
            
            html += `<div class="day-column">
                <div class="day-header-small">
                    <div class="day-name">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div class="day-number">${date.getDate()}</div>
                </div>
                <div class="day-events-small">`;
            
            dayEvents.forEach(event => {
                html += createEventHTML(event);
            });
            
            html += `</div></div>`;
        }
        
        html += `</div></div>`;
        return html;
    }
    
    function displayMonthView(eventsByDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        let html = `<div class="month-view">
            <div class="month-grid">
                <div class="weekday-headers">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div class="month-days">`;
        
        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="empty-day"></div>';
        }
        
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = date.toDateString() === new Date().toDateString();
            
            html += `<div class="month-day ${isToday ? 'today' : ''}">
                <div class="day-number">${day}</div>
                <div class="day-events-mini">`;
            
            dayEvents.slice(0, 3).forEach(event => {
                html += `<div class="event-dot ${event.entry_type}" title="${event.title}"></div>`;
            });
            
            if (dayEvents.length > 3) {
                html += `<div class="event-more">+${dayEvents.length - 3}</div>`;
            }
            
            html += `</div></div>`;
        }
        
        html += `</div></div></div>`;
        return html;
    }
    
    function displayYearView(eventsByDate) {
        const year = currentDate.getFullYear();
        
        let html = `<div class="year-view">
            <div class="year-grid">`;
        
        for (let month = 0; month < 12; month++) {
            const firstDay = new Date(year, month, 1);
            const monthName = firstDay.toLocaleDateString('en-US', { month: 'long' });
            
            html += `<div class="month-card" data-month="${month}">
                <div class="month-card-header">${monthName}</div>
                <div class="month-card-days">`;
            
            // Simple month preview with first day of week
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfWeek = new Date(year, month, 1).getDay();
            
            for (let day = 1; day <= Math.min(daysInMonth, 35); day++) {
                const date = new Date(year, month, day);
                const dateStr = date.toISOString().split('T')[0];
                const hasEvents = eventsByDate[dateStr] && eventsByDate[dateStr].length > 0;
                const isToday = date.toDateString() === new Date().toDateString();
                
                html += `<div class="mini-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}">${day}</div>`;
            }
            
            html += `</div></div>`;
        }
        
        html += `</div></div>`;
        return html;
    }
    
    function updateDateDisplay() {
        const display = document.getElementById('calendar-date-display');
        const filterType = document.getElementById('calendar-filter-type').value;
        
        switch (filterType) {
            case 'day':
                display.textContent = currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                break;
            case 'week':
                const startOfWeek = new Date(currentDate);
                const day = startOfWeek.getDay();
                const diff = startOfWeek.getDate() - day;
                startOfWeek.setDate(diff);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                
                display.textContent = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                break;
            case 'month':
                display.textContent = currentDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                });
                break;
            case 'year':
                display.textContent = currentDate.getFullYear().toString();
                break;
        }
    }
    
    function navigatePrevious() {
        const filterType = document.getElementById('calendar-filter-type').value;
        
        switch (filterType) {
            case 'day':
                currentDate.setDate(currentDate.getDate() - 1);
                break;
            case 'week':
                currentDate.setDate(currentDate.getDate() - 7);
                break;
            case 'month':
                currentDate.setMonth(currentDate.getMonth() - 1);
                break;
            case 'year':
                currentDate.setFullYear(currentDate.getFullYear() - 1);
                break;
        }
        
        loadCalendarEvents();
    }
    
    function navigateNext() {
        const filterType = document.getElementById('calendar-filter-type').value;
        
        switch (filterType) {
            case 'day':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'week':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'month':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            case 'year':
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                break;
        }
        
        loadCalendarEvents();
    }

    // Setup calendar event listeners
    function setupCalendarListeners() {
        // Filter change listeners
        document.getElementById('calendar-filter-type').addEventListener('change', loadCalendarEvents);
        document.getElementById('calendar-entry-type').addEventListener('change', loadCalendarEvents);
        document.getElementById('calendar-category').addEventListener('change', loadCalendarEvents);
        
        // Refresh button
        document.getElementById('refresh-calendar').addEventListener('click', loadCalendarEvents);
    }